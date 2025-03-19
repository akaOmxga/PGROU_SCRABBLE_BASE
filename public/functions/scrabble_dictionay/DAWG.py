import hashlib

class DAWGNode:
    next_idx=0
    """Represents a node in a DAWG"""
    def __init__(self):
        self.idx= DAWGNode.next_idx
        DAWGNode.next_idx +=1
        self.edges = {}  # Character -> DAWGNode
        self.final = False  # End of a word?

    def __str__(self):        
        arr = []
        if self.final: 
            arr.append("1")
        else:
            arr.append("0")

        for (label, node) in self.edges.items():
            arr.append( label )
            arr.append( str( node.idx ))
        return "_".join(arr)
    
    def __hash__(self):
        """ we define the hash for this dataType because we will use in the minimized nodes dictionary to
        accelerate the search"""
        return self.__str__().__hash__()

    def __eq__(self, other):
        """ we override the equality operator for the search later. We define two nodes as equal if they 
        are both the final part of a word, or they are both not the final part of a word. They also need 
        to have exactly the same edges pointing to exactly the same other nodes.
        """
        return self.__str__() == other.__str__()

    def get_id(self):
        """Generate a unique ID for this node using SHA-1"""
        signature = self.__str__()
        return hashlib.sha1(signature.encode()).hexdigest()

class DAWG:
    """Builds DAWG our MA-FSA and all the associated method insertion search(exact and prefix)
    """
    def __init__(self):
        self.unchecked_nodes = []
        self.previous_word = ""
        self.root = DAWGNode()
        self.minimized_nodes = {}
    
    def insert( self, word ):
        if word <= self.previous_word:
            raise Exception("Error: Words must be inserted in alphabetical " +
                "order.")

        # find common prefix between word and previous word
        commonPrefix = 0
        for i in range( min( len( word ), len( self.previous_word ) ) ):
            if word[i] != self.previous_word[i]: break
            commonPrefix += 1

        # Check the uncheckedNodes for redundant nodes, proceeding from last
        # one down to the common prefix size. Then truncate the list at that
        # point.
        self._minimize( commonPrefix )


        # add the suffix, starting from the correct node mid-way through the
        # graph
        if len(self.unchecked_nodes) == 0:
            node = self.root
        else:
            node = self.unchecked_nodes[-1][2]

        for letter in word[commonPrefix:]:
            nextNode = DAWGNode()
            node.edges[letter] = nextNode
            self.unchecked_nodes.append( (node, letter, nextNode) )
            node = nextNode

        node.final = True
        self.previous_word = word


    def finish( self ):
        # minimize all uncheckedNodes
        self._minimize( 0 )

    def _minimize( self, downTo ):
        # proceed from the leaf up to a certain point given by downTo
        for i in range( len(self.unchecked_nodes) - 1, downTo - 1, -1 ):
            (parent, letter, child) = self.unchecked_nodes[i]
            if child in self.minimized_nodes:
                # replace the child with the previously encountered one
                parent.edges[letter] = self.minimized_nodes[child]
            else:
                # add the state to the minimized nodes.
                self.minimized_nodes[child] = child
            self.unchecked_nodes.pop()


    def nodeCount( self ):
        return len(self.minimized_nodes)

    def edgeCount( self ):
        count = 0
        for node in self.minimized_nodes:
            count += len(node.edges)
        return count
    
    def exact_search(self, word):
        """Checks if a word exists in the DAWG"""
        current_node = self.root
        for char in word:
            if char not in current_node.edges:
                return False
            current_node = current_node.edges[char]
        return current_node.final
    
    def reconstruct_words_from_dawg(self, node, prefix="", words=None):
        """
        Recursively reconstructs all possible words stored in the DAWG from a prefix
        
        :param node: The current DAWGNode being traversed.
        :param prefix: The current word being built.
        :param words: A set to store the found words.
        :return: A set of words reconstructed from the DAWG.
        """
        if words is None:
            words = set()

        # If this node is final, add the current prefix to words
        if node.final:
            words.add(prefix)

        # Recursively traverse all edges
        for char, child in node.edges.items():
            self.reconstruct_words_from_dawg(child, prefix + char, words)

        return words
    
    def prefix_serach(self,prefix):
        current_node = self.root
        for char in prefix:
            if char not in current_node.edges:
                return False
            current_node = current_node.edges[char]
        return self.reconstruct_words_from_dawg(current_node,prefix=prefix)
    
    def _serialize_node(self, node):
        """Recursively converts the DAWGNode structure into a dictionary format."""
        serialized = {"final": node.final, "edges": {}}
        for char, child in node.edges.items():
            serialized["edges"][char] = child.get_id()
        return serialized

    def serialize_dawg(self):
        """Saves the DAWG to dict and stores the root node ID as root
        we serialize the dawg to only one document to avoid the read
        and write limits in firestore"""
        
        doc = {}
        visited = {}

        def dfs(node):
            """Recursively stores DAWG nodes in a dictionary"""
            node_id = node.get_id()
            if node_id in visited:
                return
            visited[node_id] = node
            doc[node_id] = self._serialize_node(node)
            for child in node.edges.values():
                dfs(child)

        dfs(self.root)
        doc["root"]=doc.pop(self.root.get_id())
        return doc
        