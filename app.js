document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const skipTutorial = document.getElementById('skipTutorial');
    const closeTutorial = document.getElementById('closeTutorial');
    const searchBar = document.getElementById('searchBar');
    const budgetInput = document.getElementById('budgetInput');
    const setBudgetButton = document.getElementById('setBudgetButton');
    const remainingBudget = document.getElementById('remainingBudget');
    const shoppingList = document.getElementById('shoppingList');
    const addItemButton = document.getElementById('addItemButton');
    const addItemModal = document.getElementById('addItemModal');
    const closeAddItemModal = document.getElementById('closeAddItemModal');
    const cancelAdd = document.getElementById('cancelAdd');
    const confirmAdd = document.getElementById('confirmAdd');
    const categories = document.querySelectorAll('.category');
    const navItems = document.querySelectorAll('.nav-item');
    const addListButton = document.getElementById('addListButton');
    const addListModal = document.getElementById('addListModal');
    const cancelListAdd = document.getElementById('cancelListAdd');
    const confirmListAdd = document.getElementById('confirmListAdd');
    const listName = document.getElementById('listName');
    const itemList = document.getElementById('itemList');
    const allLists = document.getElementById('allLists');
    const voiceCommandBtn = document.getElementById('voiceCommandBtn');
    const voiceCommandModal = document.getElementById('voiceCommandModal');
    const voiceStatus = document.getElementById('voiceStatus');
    const voiceText = document.getElementById('voiceText');
    const stopVoiceCommand = document.getElementById('stopVoiceCommand');

    // State Management
    let total = 0;
    let budget = 0;
    let lists = [{ name: 'Default List', id: 'default', items: [] }];
    let activeCategory = 'all';
    const groceryItems = {
        dairy: ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Eggs'],
        vegetables: ['Tomatoes', 'Carrots', 'Broccoli', 'Spinach', 'Onions'],
        fruits: ['Apples', 'Bananas', 'Oranges', 'Grapes', 'Strawberries'],
        meat: ['Chicken', 'Beef', 'Pork', 'Fish', 'Turkey'],
        pantry: ['Rice', 'Pasta', 'Bread', 'Cereal', 'Flour'],
        snacks: ['Chips', 'Cookies', 'Candy', 'Popcorn', 'Nuts']
    };

    const storeLayout = {
        nodes: [
            { id: 'entrance', x: 170, y: 350, label: 'Entrance', items: [] },
            { id: 'dairy', x: 50, y: 100, label: 'Dairy', items: ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Eggs'] },
            { id: 'vegetables', x: 170, y: 50, label: 'Vegetables', items: ['Tomatoes', 'Carrots', 'Broccoli', 'Spinach', 'Onions'] },
            { id: 'fruits', x: 290, y: 100, label: 'Fruits', items: ['Apples', 'Bananas', 'Oranges', 'Grapes', 'Strawberries'] },
            { id: 'meat', x: 50, y: 200, label: 'Meat', items: ['Chicken', 'Beef', 'Pork', 'Fish', 'Turkey'] },
            { id: 'pantry', x: 290, y: 200, label: 'Pantry', items: ['Rice', 'Pasta', 'Bread', 'Cereal', 'Flour'] },
            { id: 'snacks', x: 170, y: 250, label: 'Snacks', items: ['Chips', 'Cookies', 'Candy', 'Popcorn', 'Nuts'] }
        ],
        edges: [
            ['entrance', 'dairy'],
            ['entrance', 'meat'],
            ['entrance', 'pantry'],
            ['entrance', 'snacks'],
            ['dairy', 'vegetables'],
            ['vegetables', 'fruits'],
            ['meat', 'pantry']
        ]
    };

    // Tutorial Management
    if (!localStorage.getItem('tutorialShown')) {
        showTutorial();
    } else {
        tutorialOverlay.style.display = 'none';
    }

    function showTutorial() {
        tutorialOverlay.style.display = 'flex';
    }

    skipTutorial.addEventListener('click', () => {
        tutorialOverlay.style.display = 'none';
        localStorage.setItem('tutorialShown', 'true');
    });

    closeTutorial.addEventListener('click', () => {
        tutorialOverlay.style.display = 'none';
    });

    // Budget Management
    setBudgetButton.addEventListener('click', () => {
        budget = parseFloat(budgetInput.value) || 0;
        if (budget > 0) {
            updateRemainingBudget();
            saveToLocalStorage();
        } else {
            alert('Please set a valid budget.');
        }
    });

    function updateRemainingBudget() {
        const remaining = budget - total;
        remainingBudget.textContent = `Remaining: $${remaining.toFixed(2)}`;
        if (remaining < 0) {
            remainingBudget.style.color = 'red';
        } else {
            remainingBudget.style.color = 'black';
        }
    }

    // Search Functionality
    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const suggestions = document.createElement('div');
        suggestions.className = 'suggestions';
        
        if (searchTerm.length > 0) {
            Object.entries(groceryItems).forEach(([category, items]) => {
                items.forEach(item => {
                    if (item.toLowerCase().includes(searchTerm)) {
                        const suggestion = document.createElement('div');
                        suggestion.className = 'suggestion-item';
                        suggestion.textContent = `${item} (${category})`;
                        suggestion.addEventListener('click', () => {
                            document.getElementById('itemName').value = item;
                            document.getElementById('itemCategory').value = category;
                            addItemModal.classList.remove('hidden');
                        });
                        suggestions.appendChild(suggestion);
                    }
                });
            });
        }

        // Remove old suggestions
        const oldSuggestions = document.querySelector('.suggestions');
        if (oldSuggestions) oldSuggestions.remove();
        
        if (suggestions.children.length > 0) {
            searchBar.parentElement.appendChild(suggestions);
        }
    });

    // Item Management
    addItemButton.addEventListener('click', () => {
        if (budget > 0) {
            addItemModal.classList.remove('hidden');
        } else {
            alert('Please set a budget first.');
        }
    });

    closeAddItemModal.addEventListener('click', () => {
        addItemModal.classList.add('hidden');
        clearModalInputs();
    });

    cancelAdd.addEventListener('click', () => {
        addItemModal.classList.add('hidden');
        clearModalInputs();
    });

    confirmAdd.addEventListener('click', () => {
        const name = document.getElementById('itemName').value;
        const price = parseFloat(document.getElementById('itemPrice').value);
        const category = document.getElementById('itemCategory').value;
        const listId = itemList.value;

        if (name && price && category) {
            addItem(name, price, category, listId);
            addItemModal.classList.add('hidden');
            clearModalInputs();
        }
    });

    function addItem(name, price, category, listId) {
        const item = { 
            name, 
            price, 
            category, 
            id: Date.now(),
            purchased: false
        };
        const list = lists.find(list => list.id === listId);
        if (list) {
            list.items.push(item);
            total += price;
            updateRemainingBudget();
            renderItems();
            updateStoreMap();
            saveToLocalStorage();
            
            // Show suggestions if available
            if (productSuggestions[name.toLowerCase()]) {
                showSuggestions(name);
            }
        }
    }

    function renderItems() {
        shoppingList.innerHTML = '';
        
        lists.forEach(list => {
            // Add a list header if there are items in this list
            const listItems = list.items.filter(item => 
                activeCategory === 'all' || item.category === activeCategory
            );
            
            if (listItems.length > 0) {
                const listHeader = document.createElement('div');
                listHeader.className = 'list-header font-bold text-lg mb-2 mt-4';
                listHeader.textContent = list.name;
                shoppingList.appendChild(listHeader);
            }

            listItems.forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-item flex justify-between items-center p-4 bg-white rounded shadow mb-3';
                li.innerHTML = `
                    <div class="flex items-center gap-3">
                        <input type="checkbox" 
                            class="item-checkbox w-5 h-5 text-green-500 rounded cursor-pointer"
                            ${item.purchased ? 'checked' : ''}
                            data-id="${item.id}"
                        >
                        <div class="item-info">
                            <span class="item-name font-bold ${item.purchased ? 'line-through text-gray-500' : ''}">${item.name}</span>
                            <span class="item-category text-sm text-gray-500">${item.category}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="item-price text-green-500 font-bold">$${item.price.toFixed(2)}</span>
                        <button class="delete-btn text-red-500" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                shoppingList.appendChild(li);
            });
        });

        // Add event listeners for checkboxes and delete buttons
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                lists.forEach(list => {
                    const item = list.items.find(item => item.id === id);
                    if (item) {
                        item.purchased = e.target.checked;
                        renderItems();
                        updateStoreMap();
                        saveToLocalStorage();
                    }
                });
            });
        });

        // Add delete functionality
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                lists.forEach(list => {
                    const itemIndex = list.items.findIndex(item => item.id === id);
                    if (itemIndex > -1) {
                        total -= list.items[itemIndex].price;
                        list.items.splice(itemIndex, 1);
                    }
                });
                updateRemainingBudget();
                renderItems();
                updateStoreMap();
                saveToLocalStorage();
            });
        });
    }

    // List Management
    addListButton.addEventListener('click', () => {
        addListModal.classList.remove('hidden');
    });

    cancelListAdd.addEventListener('click', () => {
        addListModal.classList.add('hidden');
        listName.value = '';
    });

    confirmListAdd.addEventListener('click', () => {
        const name = listName.value.trim();
        if (name) {
            const newList = {
                name,
                id: Date.now().toString(),
                items: []
            };
            lists.push(newList);
            renderLists();
            updateListOptions();
            addListModal.classList.add('hidden');
            listName.value = '';
            saveToLocalStorage();
        }
    });

    function addList(name) {
        const list = { name, id: Date.now().toString(), items: [] };
        lists.push(list);
        renderLists();
        updateListOptions();
    }

    window.renderLists = function() {
        allLists.innerHTML = '';
        lists.forEach(list => {
            // Don't allow deletion of the Default List
            const isDefaultList = list.id === 'default';
            
            const listElement = document.createElement('div');
            listElement.className = 'bg-white p-4 rounded-lg shadow-md mb-4';
            listElement.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-bold text-lg">${list.name}</h3>
                    <div class="flex gap-2">
                        <button 
                            onclick="showShareOptions('${list.id}')"
                            class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            title="Share List"
                        >
                            <i class="fas fa-share-alt"></i>
                        </button>
                        <button 
                            onclick="openList('${list.id}')"
                            class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            title="View List"
                        >
                            <i class="fas fa-eye"></i>
                        </button>
                        ${!isDefaultList ? `
                            <button 
                                onclick="deleteList('${list.id}')"
                                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                title="Delete List"
                            >
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="text-gray-600">
                    ${list.items.length} items - Total: $${list.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                </div>
            `;
            allLists.appendChild(listElement);
        });
    }

    // Update the deleteList function
    window.deleteList = function(listId) {
        const list = lists.find(list => list.id === listId);
        if (!list) return;

        // Show confirmation modal
        const confirmationModal = document.getElementById('confirmationModal');
        const confirmationMessage = document.getElementById('confirmationMessage');
        const cancelButton = document.getElementById('cancelDelete');
        const confirmButton = document.getElementById('confirmDelete');

        // Update confirmation message with better UI
        confirmationMessage.innerHTML = `
            <div class="space-y-4">
                <div class="text-center">
                    <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <div class="font-medium text-lg">Delete "${list.name}"?</div>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-600">
                        This list contains:
                        <div class="mt-2 space-y-2">
                            <div class="flex justify-between">
                                <span>Total Items:</span>
                                <span class="font-medium">${list.items.length}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Total Value:</span>
                                <span class="font-medium">$${list.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="text-red-500 text-sm text-center font-medium">
                    This action cannot be undone
                </div>
            </div>
        `;

        // Update button styles
        cancelButton.className = 'px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors';
        confirmButton.className = 'px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors';

        // Show modal with animation
        confirmationModal.classList.remove('hidden');
        setTimeout(() => {
            confirmationModal.querySelector('.bg-white').style.transform = 'scale(1)';
        }, 10);

        // Handle cancel
        const handleCancel = () => {
            confirmationModal.querySelector('.bg-white').style.transform = 'scale(0.95)';
            setTimeout(() => {
                confirmationModal.classList.add('hidden');
            }, 150);
            cleanup();
        };

        // Handle confirm
        const handleConfirm = () => {
            // Update total budget
            list.items.forEach(item => {
                if (!item.purchased) {
                    total -= item.price;
                }
            });
            
            // Remove the list
            lists = lists.filter(l => l.id !== listId);
            
            // Update UI
            updateRemainingBudget();
            renderLists();
            updateListOptions();
            updateStoreMap();
            saveToLocalStorage();
            
            // Hide modal with animation
            confirmationModal.querySelector('.bg-white').style.transform = 'scale(0.95)';
            setTimeout(() => {
                confirmationModal.classList.add('hidden');
            }, 150);

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>List "${list.name}" has been deleted</span>
            `;
            document.body.appendChild(successMessage);

            // Animate success message
            setTimeout(() => {
                successMessage.style.transform = 'translate(-50%, -10px)';
                successMessage.style.opacity = '0';
                setTimeout(() => successMessage.remove(), 300);
            }, 2000);

            cleanup();
        };

        // Cleanup function
        const cleanup = () => {
            cancelButton.removeEventListener('click', handleCancel);
            confirmButton.removeEventListener('click', handleConfirm);
            confirmationModal.removeEventListener('click', handleOutsideClick);
        };

        // Handle outside click
        const handleOutsideClick = (e) => {
            if (e.target === confirmationModal) {
                handleCancel();
            }
        };

        // Add event listeners
        cancelButton.addEventListener('click', handleCancel);
        confirmButton.addEventListener('click', handleConfirm);
        confirmationModal.addEventListener('click', handleOutsideClick);
    };

    // Add this function to show success message
    function showSuccessMessage(listName) {
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform translate-y-0 opacity-100 transition-all duration-500 z-50';
        successMessage.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-check-circle"></i>
                <span>List "${listName}" has been deleted</span>
            </div>
        `;
        
        document.body.appendChild(successMessage);

        // Animate out
        setTimeout(() => {
            successMessage.style.transform = 'translate-y-2px';
            successMessage.style.opacity = '0';
        }, 2000);

        // Remove from DOM
        setTimeout(() => {
            successMessage.remove();
        }, 2500);
    }

    window.openList = function(listId) {
        const list = lists.find(list => list.id === listId);
        const listItems = document.createElement('div');
        listItems.className = 'list-view p-4';
        listItems.innerHTML = `
            <h2 class="text-xl font-bold mb-4">${list.name}</h2>
            
            <!-- Integrated Add Item Form -->
            <div class="add-item-form bg-white p-4 rounded-lg shadow mb-4">
                <h3 class="font-bold mb-2">Add New Item</h3>
                <div class="flex flex-col gap-2">
                    <input type="text" 
                        id="newItemName" 
                        placeholder="Item name" 
                        class="w-full p-2 border rounded"
                    >
                    <input type="number" 
                        id="newItemPrice" 
                        placeholder="Price" 
                        class="w-full p-2 border rounded"
                        step="0.01"
                    >
                    <button 
                        class="bg-green-500 text-white px-4 py-2 rounded w-full"
                        onclick="addItemToCurrentList('${listId}')"
                    >
                        Add Item
                    </button>
                </div>
            </div>

            <!-- Items List -->
            <div class="items-list">
                <h3 class="font-bold mb-2">Items</h3>
                <ul class="space-y-2">
                    ${list.items.map(item => `
                        <li class="flex justify-between items-center p-4 bg-white rounded shadow">
                            <div>
                                <span class="font-bold">${item.name}</span>
                                <span class="text-green-500 ml-2">$${item.price.toFixed(2)}</span>
                            </div>
                            <button class="delete-btn text-red-500" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="mt-4 flex justify-between items-center">
                <div class="text-lg font-bold">
                    Total: $${list.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                </div>
                <button class="bg-gray-500 text-white px-4 py-2 rounded" onclick="renderLists()">
                    Back to Lists
                </button>
            </div>
        `;
        
        allLists.innerHTML = '';
        allLists.appendChild(listItems);

        // Add delete functionality for items
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const itemIndex = list.items.findIndex(item => item.id === id);
                if (itemIndex > -1) {
                    list.items.splice(itemIndex, 1);
                    openList(listId);
                    updateStoreMap();
                }
            });
        });
    }

    window.addItemToCurrentList = function(listId) {
        const nameInput = document.getElementById('newItemName');
        const priceInput = document.getElementById('newItemPrice');
        
        const name = nameInput.value.trim();
        const price = parseFloat(priceInput.value);

        if (name && !isNaN(price) && price > 0) {
            addItem(name, price, 'misc', listId);
            nameInput.value = '';
            priceInput.value = '';
            openList(listId);
        } else {
            alert('Please enter valid item name and price');
        }
    }

    function updateListOptions() {
        itemList.innerHTML = '';
        lists.forEach(list => {
            const option = document.createElement('option');
            option.value = list.id;
            option.textContent = list.name;
            itemList.appendChild(option);
        });
    }

    // Category Management
    categories.forEach(category => {
        category.addEventListener('click', () => {
            categories.forEach(c => {
                c.classList.remove('bg-green-500', 'text-white');
                c.classList.add('bg-gray-200');
            });
            category.classList.add('bg-green-500', 'text-white');
            category.classList.remove('bg-gray-200');
            activeCategory = category.dataset.category;
            renderItems();
            saveToLocalStorage();
        });
    });

    // Navigation Management
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const screen = item.dataset.screen;
            document.querySelectorAll('#shoppingListScreen, #listsScreen, #settingsScreen').forEach(s => {
                s.classList.add('hidden');
            });
            document.getElementById(`${screen}Screen`).classList.remove('hidden');
            
            // Update active state
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    function clearModalInputs() {
        document.getElementById('itemName').value = '';
        document.getElementById('itemPrice').value = '';
        document.getElementById('itemCategory').value = 'dairy';
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addItemModal) {
            addItemModal.classList.add('hidden');
            clearModalInputs();
        }
        if (e.target === addListModal) {
            addListModal.classList.add('hidden');
            listName.value = '';
        }
    });

    // Initialize list options
    updateListOptions();

    // Add these functions for map rendering
    function initializeStoreMap() {
        const canvas = document.getElementById('mapCanvas');
        const ctx = canvas.getContext('2d');
        
        function getNodeItemCount(node) {
            return lists.reduce((count, list) => {
                return count + list.items.filter(item => 
                    !item.purchased &&
                    node.items.some(nodeItem => 
                        nodeItem.toLowerCase() === item.name.toLowerCase()
                    )
                ).length;
            }, 0);
        }
        
        function drawMap() {
            const isDarkMode = document.body.classList.contains('dark-mode');
            
            // Update colors based on theme
            const edgeColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#ddd';
            const nodeInactiveColor = isDarkMode ? '#2D2D2D' : '#ddd';
            const textColor = isDarkMode ? '#E0E0E0' : '#333';
            const activeNodeColor = isDarkMode ? '#66BB6A' : '#4CAF50';
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw edges
            storeLayout.edges.forEach(([fromId, toId]) => {
                const nodeFrom = storeLayout.nodes.find(n => n.id === fromId);
                const nodeTo = storeLayout.nodes.find(n => n.id === toId);
                
                ctx.beginPath();
                ctx.moveTo(nodeFrom.x, nodeFrom.y);
                ctx.lineTo(nodeTo.x, nodeTo.y);
                ctx.strokeStyle = edgeColor;
                ctx.lineWidth = 2;
                ctx.stroke();
            });
            
            // Draw nodes
            storeLayout.nodes.forEach(node => {
                const itemCount = getNodeItemCount(node);
                
                ctx.beginPath();
                ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);
                
                // Color based on whether there are items
                ctx.fillStyle = itemCount > 0 ? activeNodeColor : nodeInactiveColor;
                ctx.fill();
                
                // Node border
                ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Add label
                ctx.fillStyle = textColor;
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.label, node.x, node.y);
                
                // Add item count if > 0
                if (itemCount > 0) {
                    ctx.beginPath();
                    ctx.arc(node.x + 20, node.y - 20, 10, 0, 2 * Math.PI);
                    ctx.fillStyle = isDarkMode ? '#2D2D2D' : 'white';
                    ctx.fill();
                    ctx.strokeStyle = activeNodeColor;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    ctx.fillStyle = isDarkMode ? '#E0E0E0' : '#333';
                    ctx.font = 'bold 10px Arial';
                    ctx.fillText(itemCount, node.x + 20, node.y - 20);
                }
            });
        }

        // Initial draw
        drawMap();

        // Add click handler for nodes
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);
            
            storeLayout.nodes.forEach(node => {
                const distance = Math.sqrt(
                    Math.pow(x - node.x, 2) + 
                    Math.pow(y - node.y, 2)
                );
                
                if (distance < 25) {
                    showNodeInfo(node);
                }
            });
        });

        return drawMap;
    }

    // Initialize the map when the DOM loads
    const updateStoreMap = initializeStoreMap();
    window.updateStoreMap = updateStoreMap;

    // Add this function to show node information in a modal
    function showNodeInfo(node) {
        const nodeInfoModal = document.getElementById('nodeInfoModal');
        const nodeTitle = document.getElementById('nodeTitle');
        const nodeContent = document.getElementById('nodeContent');
        
        // Get items for this node
        const nodeItems = lists.reduce((items, list) => {
            const matchingItems = list.items.filter(item => 
                node.items.some(nodeItem => 
                    nodeItem.toLowerCase() === item.name.toLowerCase()
                )
            );
            return [...items, ...matchingItems];
        }, []);

        const purchasedItems = nodeItems.filter(item => item.purchased);
        const unpurchasedItems = nodeItems.filter(item => !item.purchased);

        // Set modal title
        nodeTitle.textContent = `${node.label} Section`;

        // Create modal content
        nodeContent.innerHTML = `
            <div class="node-info-section">
                <div class="node-info-title">Items to Buy (${unpurchasedItems.length})</div>
                ${unpurchasedItems.length > 0 ? 
                    unpurchasedItems.map(item => `
                        <div class="node-info-item">
                            <span>• ${item.name}</span>
                            <span class="node-info-price">$${item.price.toFixed(2)}</span>
                        </div>
                    `).join('') : 
                    '<div class="text-gray-500">None</div>'
                }
            </div>

            <div class="node-info-section">
                <div class="node-info-title">Purchased Items (${purchasedItems.length})</div>
                ${purchasedItems.length > 0 ? 
                    purchasedItems.map(item => `
                        <div class="node-info-item">
                            <span><i class="fas fa-check node-info-check"></i>${item.name}</span>
                            <span class="node-info-price">$${item.price.toFixed(2)}</span>
                        </div>
                    `).join('') : 
                    '<div class="text-gray-500">None</div>'
                }
            </div>

            <div class="node-info-section">
                <div class="node-info-title">Available Items in Store</div>
                ${node.items.map(item => `
                    <div class="available-item">- ${item}</div>
                `).join('')}
            </div>
        `;

        // Show modal
        nodeInfoModal.classList.remove('hidden');

        // Add close functionality
        const closeButton = document.getElementById('closeNodeInfo');
        closeButton.onclick = () => nodeInfoModal.classList.add('hidden');

        // Close on outside click
        nodeInfoModal.onclick = (e) => {
            if (e.target === nodeInfoModal) {
                nodeInfoModal.classList.add('hidden');
            }
        };
    }

    // Add this suggestions database
    const productSuggestions = {
        'bread': [
            { name: 'Eggs', category: 'dairy', reason: 'Perfect for breakfast' },
            { name: 'Butter', category: 'dairy', reason: 'Great with bread' },
            { name: 'Jam', category: 'pantry', reason: 'Classic bread spread' },
            { name: 'Cheese', category: 'dairy', reason: 'Make a sandwich' }
        ],
        'pasta': [
            { name: 'Tomato Sauce', category: 'pantry', reason: 'Essential for pasta' },
            { name: 'Parmesan Cheese', category: 'dairy', reason: 'Traditional topping' },
            { name: 'Garlic', category: 'vegetables', reason: 'Flavor enhancer' },
            { name: 'Olive Oil', category: 'pantry', reason: 'For cooking pasta' }
        ],
        'chicken': [
            { name: 'Rice', category: 'pantry', reason: 'Perfect side dish' },
            { name: 'Vegetables', category: 'vegetables', reason: 'Healthy combination' },
            { name: 'Garlic', category: 'vegetables', reason: 'For seasoning' },
            { name: 'Onions', category: 'vegetables', reason: 'Base for cooking' }
        ],
        'milk': [
            { name: 'Cereal', category: 'pantry', reason: 'Breakfast essential' },
            { name: 'Cookies', category: 'snacks', reason: 'Classic combination' },
            { name: 'Coffee', category: 'pantry', reason: 'For your coffee' },
            { name: 'Chocolate Powder', category: 'pantry', reason: 'Make chocolate milk' }
        ],
        // Add more suggestions as needed
    };

    // Make addSuggestedItem globally accessible
    window.addSuggestedItem = function(name, category) {
        const modal = document.getElementById('nodeInfoModal');
        modal.classList.add('hidden');
        
        // Show price input modal
        const priceModal = document.createElement('div');
        priceModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        priceModal.innerHTML = `
            <div class="bg-white p-6 rounded-lg w-11/12 max-w-md relative">
                <h3 class="text-lg font-bold mb-4">Set Price for ${name}</h3>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                        Suggested price for ${category}: $${defaultPrices[category]}
                    </label>
                    <input 
                        type="number" 
                        id="suggestedItemPrice" 
                        class="w-full p-2 border rounded" 
                        value="${defaultPrices[category]}"
                        step="0.01"
                        min="0"
                    >
                </div>
                <div class="flex justify-end space-x-2">
                    <button 
                        onclick="this.closest('.fixed').remove()"
                        class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button 
                        onclick="confirmSuggestedItem('${name}', '${category}')"
                        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Add Item
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(priceModal);
    };

    // Add this function to handle the final addition of suggested item
    window.confirmSuggestedItem = function(name, category) {
        const priceInput = document.getElementById('suggestedItemPrice');
        const price = parseFloat(priceInput.value);
        
        if (!isNaN(price) && price >= 0) {
            addItem(name, price, category, 'default');
            showToast(`Added ${name} to your list!`);
            // Remove the price input modal
            priceInput.closest('.fixed').remove();
        } else {
            alert('Please enter a valid price');
        }
    };

    // Default prices object (move it outside the function to be accessible)
    const defaultPrices = {
        dairy: 3.99,
        vegetables: 2.49,
        fruits: 2.99,
        meat: 7.99,
        pantry: 4.99,
        snacks: 3.49
    };

    // Update the suggestions modal HTML
    function showSuggestions(itemName) {
        const suggestions = productSuggestions[itemName.toLowerCase()];
        if (!suggestions) return;

        const nodeInfoModal = document.getElementById('nodeInfoModal');
        const nodeTitle = document.getElementById('nodeTitle');
        const nodeContent = document.getElementById('nodeContent');
        
        nodeTitle.textContent = 'Suggested Items';
        
        nodeContent.innerHTML = `
            <div class="suggestions-container">
                <p class="text-gray-600 mb-4">We noticed you added ${itemName}. Would you also like:</p>
                ${suggestions.map(suggestion => `
                    <div class="suggestion-item bg-gray-50 p-4 rounded-lg mb-3">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-bold">${suggestion.name}</h3>
                                <p class="text-sm text-gray-600">${suggestion.reason}</p>
                                <span class="text-xs text-gray-500">Category: ${suggestion.category}</span>
                            </div>
                            <button 
                                onclick="addSuggestedItem('${suggestion.name}', '${suggestion.category}')"
                                class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                `).join('')}
                <div class="flex justify-end mt-4">
                    <button 
                        onclick="document.getElementById('nodeInfoModal').classList.add('hidden')"
                        class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                    >
                        Skip All
                    </button>
                </div>
            </div>
        `;

        nodeInfoModal.classList.remove('hidden');
    }

    // Add this function for showing toasts
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }

    // Add these functions for sharing functionality
    function generateShareableLink(listId) {
        const list = lists.find(list => list.id === listId);
        if (!list) return null;

        // Create a shareable object with specific list data
        const shareableData = {
            listName: list.name,
            items: list.items.map(item => ({
                name: item.name,
                price: item.price,
                category: item.category,
                purchased: item.purchased
            })),
            totalAmount: list.items.reduce((sum, item) => sum + item.price, 0),
            createdAt: new Date().toISOString()
        };

        // Encode the data
        const encodedData = btoa(JSON.stringify(shareableData));
        return `${window.location.origin}/share?list=${encodedData}`;
    }

    // Function to show share options
    window.showShareOptions = function(listId) {
        const list = lists.find(list => list.id === listId);
        if (!list) return;

        const shareModal = document.getElementById('shareListModal');
        const shareLinkInput = document.getElementById('shareLink');
        const shareableLink = generateShareableLink(listId);
        
        // Update modal content to show list name
        const modalTitle = shareModal.querySelector('h2');
        modalTitle.textContent = `Share List: ${list.name}`;
        
        shareLinkInput.value = shareableLink;
        shareModal.classList.remove('hidden');

        // Update share buttons to include listId
        const shareButtons = shareModal.querySelectorAll('.share-btn');
        shareButtons.forEach(btn => {
            const channel = btn.getAttribute('data-channel');
            btn.onclick = () => shareList(channel, listId);
        });

        // Add copy link functionality
        document.getElementById('copyLink').onclick = function() {
            shareLinkInput.select();
            document.execCommand('copy');
            showToast('Link copied to clipboard!');
        };

        // Add close functionality
        document.getElementById('closeShareModal').onclick = function() {
            shareModal.classList.add('hidden');
        };

        // Close on outside click
        shareModal.onclick = function(e) {
            if (e.target === shareModal) {
                shareModal.classList.add('hidden');
            }
        };
    };

    // Function to share list through different channels
    window.shareList = function(channel, listId) {
        const shareLinkInput = document.getElementById('shareLink');
        const shareableLink = shareLinkInput.value;
        const list = lists.find(list => list.id === listId);
        
        if (!list) return;

        const shareText = `Check out my shopping list "${list.name}": ${shareableLink}`;
        const subject = `Shopping List: ${list.name}`;
        const body = `Here's my shopping list "${list.name}":\n\n${list.items.map(item => 
            `• ${item.name} - $${item.price.toFixed(2)}${item.purchased ? ' ✓' : ''}`
        ).join('\n')}\n\nTotal: $${list.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}`;

        switch(channel) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + body)}`);
                break;
            case 'email':
                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\nView online: ' + shareableLink)}`;
                break;
        }
    };

    // Add styles for the share feature
    const shareStyles = `
        .share-btn {
            transition: all 0.3s ease;
        }
        .share-btn:hover {
            transform: translateY(-2px);
        }
        .share-link-container {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 0.5rem;
        }
    `;

    // Add styles to document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = shareStyles;
    document.head.appendChild(styleSheet);

    // Add these functions for data persistence at the top of your file
    function saveToLocalStorage() {
        const appData = {
            lists: lists,
            budget: budget,
            total: total,
            activeCategory: activeCategory
        };
        localStorage.setItem('groceryAppData', JSON.stringify(appData));
    }

    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('groceryAppData');
        if (savedData) {
            const appData = JSON.parse(savedData);
            lists = appData.lists;
            budget = appData.budget || 0;
            total = appData.total || 0;
            activeCategory = appData.activeCategory || 'all';
            
            // Update UI with loaded data
            updateRemainingBudget();
            renderItems();
            renderLists();
            updateListOptions();
            updateStoreMap();
            
            // Update budget input
            budgetInput.value = budget;
            
            // Update category selection
            categories.forEach(cat => {
                if (cat.dataset.category === activeCategory) {
                    cat.classList.add('bg-green-500', 'text-white');
                    cat.classList.remove('bg-gray-200');
                } else {
                    cat.classList.remove('bg-green-500', 'text-white');
                    cat.classList.add('bg-gray-200');
                }
            });
        }
    }

    // Load data when the app starts
    document.addEventListener('DOMContentLoaded', () => {
        loadFromLocalStorage();
        // ... rest of your initialization code
    });

    // Voice Command functionality
    function initializeVoiceCommands() {
        if (!('webkitSpeechRecognition' in window)) {
            voiceCommandBtn.style.display = 'none';
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        let isListening = false;

        voiceCommandBtn.addEventListener('click', () => {
            if (isListening) {
                stopListening();
            } else {
                startListening();
            }
        });

        stopVoiceCommand.addEventListener('click', () => {
            stopListening();
        });

        function startListening() {
            try {
                if (!isListening) {
                    voiceCommandModal.classList.remove('hidden');
                    recognition.start();
                    isListening = true;
                    voiceStatus.textContent = 'Listening...';
                    voiceStatus.className = 'listening';
                    voiceCommandBtn.innerHTML = '<i class="fas fa-stop"></i>';
                }
            } catch (e) {
                console.error('Speech recognition error:', e);
                handleError('Failed to start listening. Please try again.');
            }
        }

        function stopListening() {
            try {
                recognition.stop();
                isListening = false;
                voiceCommandModal.classList.add('hidden');
                voiceCommandBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            } catch (e) {
                console.error('Error stopping recognition:', e);
            }
        }

        function handleError(message) {
            voiceStatus.textContent = message;
            voiceStatus.className = 'error';
            setTimeout(() => {
                voiceCommandModal.classList.add('hidden');
                isListening = false;
                voiceCommandBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            }, 2000);
        }

        recognition.onstart = () => {
            isListening = true;
            voiceStatus.textContent = 'Listening...';
            voiceStatus.className = 'listening';
        };

        recognition.onend = () => {
            isListening = false;
            if (!voiceCommandModal.classList.contains('hidden')) {
                // Only restart if the modal is still open and no result was received
                startListening();
            }
        };

        recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript.toLowerCase();
            voiceText.textContent = `"${command}"`;

            if (event.results[last].isFinal) {
                stopListening();
                processVoiceCommand(command);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            switch (event.error) {
                case 'no-speech':
                    handleError('No speech detected. Please try again.');
                    break;
                case 'aborted':
                    handleError('Listening was aborted. Please try again.');
                    break;
                case 'network':
                    handleError('Network error occurred. Please check your connection.');
                    break;
                case 'not-allowed':
                case 'service-not-allowed':
                    handleError('Microphone access denied. Please allow microphone access.');
                    break;
                default:
                    handleError('An error occurred. Please try again.');
            }
        };

        // Add visual feedback when microphone is active
        const pulseAnimation = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        const style = document.createElement('style');
        style.textContent = pulseAnimation;
        document.head.appendChild(style);

        // Add this class to your CSS
        voiceCommandBtn.style.animation = 'none';
        voiceCommandBtn.addEventListener('click', () => {
            if (isListening) {
                voiceCommandBtn.style.animation = 'none';
            } else {
                voiceCommandBtn.style.animation = 'pulse 1.5s infinite';
            }
        });

        // Add this inside initializeVoiceCommands function, after the recognition.onerror handler
        function processVoiceCommand(command) {
            voiceStatus.textContent = 'Processing...';
            voiceStatus.className = 'processing';

            // Command patterns
            const addItemPattern = /add\s+(.+)/i;
            const findItemPattern = /where\s+is\s+(.+)/i;
            const pricePattern = /(\d+(\.\d{1,2})?)/;

            if (addItemPattern.test(command)) {
                let itemName = command.match(addItemPattern)[1];
                let price = 0;
                
                // Find the node containing this item
                const itemNode = storeLayout.nodes.find(node => 
                    node.items.some(nodeItem => nodeItem.toLowerCase() === itemName.toLowerCase())
                );

                // Highlight the node immediately for visual feedback
                if (itemNode) {
                    highlightNode(itemNode.id);
                }
                
                // Check if price is mentioned
                const priceMatch = command.match(pricePattern);
                if (priceMatch) {
                    price = parseFloat(priceMatch[1]);
                    itemName = itemName.replace(pricePattern, '').trim();
                } else {
                    // Use default price based on category
                    const category = determineCategory(itemName);
                    price = defaultPrices[category] || 4.99;
                }

                // Show confirmation for adding item
                showVoiceAddItemConfirmation(itemName, price);
            } 
            else if (findItemPattern.test(command)) {
                const item = command.match(findItemPattern)[1];
                findItemLocation(item);
            }
            else {
                voiceText.textContent = "Sorry, I didn't understand that command. Try saying 'add [item]' or 'where is [item]'";
                setTimeout(() => {
                    voiceCommandModal.classList.add('hidden');
                }, 2000);
            }
        }

        // Helper function to determine category
        function determineCategory(itemName) {
            for (const [category, items] of Object.entries(groceryItems)) {
                if (items.some(item => item.toLowerCase() === itemName.toLowerCase())) {
                    return category;
                }
            }
            return 'misc';
        }

        // Function to show confirmation for voice-added items
        function showVoiceAddItemConfirmation(itemName, price) {
            const category = determineCategory(itemName);
            const confirmationModal = document.getElementById('confirmationModal');
            const confirmationMessage = document.getElementById('confirmationMessage');

            // Find the node that contains this item
            const itemNode = storeLayout.nodes.find(node => 
                node.items.some(nodeItem => nodeItem.toLowerCase() === itemName.toLowerCase())
            );

            confirmationMessage.innerHTML = `
                <div class="text-center mb-4">
                    <i class="fas fa-microphone text-green-500 text-4xl mb-4"></i>
                    <div class="text-xl font-bold">Add to List?</div>
                    <div class="text-sm text-gray-500">Voice command detected</div>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex justify-between mb-2">
                        <span>Item:</span>
                        <span class="font-medium">${itemName}</span>
                    </div>
                    <div class="flex justify-between mb-2">
                        <span>Price:</span>
                        <span class="font-medium">$${price.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Category:</span>
                        <span class="font-medium">${category}</span>
                    </div>
                    ${itemNode ? `
                        <div class="mt-2 text-sm text-green-600">
                            <i class="fas fa-map-marker-alt"></i> Located in ${itemNode.label} section
                        </div>
                    ` : ''}
                </div>
            `;

            // Hide voice command modal and show confirmation
            voiceCommandModal.classList.add('hidden');
            confirmationModal.classList.remove('hidden');

            // Update button actions
            const confirmButton = document.getElementById('confirmDelete');
            const cancelButton = document.getElementById('cancelDelete');
            
            confirmButton.textContent = 'Add Item';
            confirmButton.className = 'px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors';
            
            // Update confirmation button action
            confirmButton.onclick = () => {
                addItem(itemName, price, category, 'default');
                confirmationModal.classList.add('hidden');
                showToast(`Added ${itemName} to your list`);
                
                // Update the graph with animation
                if (itemNode) {
                    highlightNode(itemNode.id);
                    setTimeout(() => {
                        updateStoreMap();
                    }, 1500);
                } else {
                    updateStoreMap();
                }
            };

            // Update cancel button action
            cancelButton.onclick = () => {
                confirmationModal.classList.add('hidden');
                showToast('Item not added');
                updateStoreMap();
            };
        }

        // Function to find item location
        function findItemLocation(itemName) {
            let found = false;
            storeLayout.nodes.forEach(node => {
                if (node.items.some(item => item.toLowerCase().includes(itemName.toLowerCase()))) {
                    voiceText.textContent = `${itemName} can be found in the ${node.label} section`;
                    found = true;
                    highlightNode(node.id);
                    setTimeout(() => {
                        voiceCommandModal.classList.add('hidden');
                        setTimeout(() => {
                            updateStoreMap();
                        }, 2000);
                    }, 2000);
                }
            });

            if (!found) {
                voiceText.textContent = `Sorry, I couldn't find ${itemName} in the store map`;
                setTimeout(() => {
                    voiceCommandModal.classList.add('hidden');
                }, 2000);
            }
        }
    }

    // Initialize voice commands
    initializeVoiceCommands();

    // Theme Management
    function initializeTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const themeText = themeToggle.querySelector('.theme-text');
        const html = document.documentElement;

        // Utility function to calculate theme setting
        function calculateTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        // Update UI elements for theme
        function updateThemeUI(theme) {
            html.setAttribute('data-theme', theme);
            
            // Update button text and icon
            const isDark = theme === 'dark';
            themeText.textContent = isDark ? 'Dark Mode' : 'Light Mode';
            themeToggle.querySelector('i').className = isDark ? 'fas fa-moon text-blue-400' : 'fas fa-sun text-yellow-500';
            
            // Update store map
            updateStoreMap();
            
            // Show feedback
            showToast(`${isDark ? 'Dark' : 'Light'} mode enabled`);
        }

        // Initialize theme
        const currentTheme = calculateTheme();
        updateThemeUI(currentTheme);

        // Theme toggle handler
        themeToggle.addEventListener('click', () => {
            const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            updateThemeUI(newTheme);
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                updateThemeUI(e.matches ? 'dark' : 'light');
            }
        });

        // Add keyboard shortcut (Ctrl/Cmd + Shift + D)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                localStorage.setItem('theme', newTheme);
                updateThemeUI(newTheme);
            }
        });
    }

    // Initialize theme when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        initializeTheme();
        // ... other initialization code
    });

    // Dark Mode Handler
    function initializeDarkMode() {
        const toggle = document.getElementById('darkModeToggle');
        const indicator = document.getElementById('darkModeIndicator');
        const icon = document.getElementById('darkModeIcon');
        
        if (!toggle) return;

        // Function to update theme
        function setDarkMode(isDark) {
            // Update document theme
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
            
            // Update toggle appearance
            toggle.setAttribute('data-active', isDark);
            icon.className = isDark ? 'fas fa-moon text-blue-400' : 'fas fa-sun text-yellow-500';
            
            // Save preference
            localStorage.setItem('darkMode', isDark);
            
            // Update UI elements
            updateStoreMap();
            updateModalBackgrounds();
            
            // Show feedback
            showToast(isDark ? 'Dark mode enabled' : 'Light mode disabled');
        }

        // Get initial state
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        const savedPreference = localStorage.getItem('darkMode');
        const initialState = savedPreference !== null 
            ? savedPreference === 'true'
            : prefersDark.matches;

        // Set initial state
        setDarkMode(initialState);

        // Toggle click handler
        toggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            setDarkMode(currentTheme !== 'dark');
        });

        // Listen for system theme changes
        prefersDark.addEventListener('change', (e) => {
            if (localStorage.getItem('darkMode') === null) {
                setDarkMode(e.matches);
            }
        });

        // Update modal backgrounds when theme changes
        function updateModalBackgrounds() {
            const modals = document.querySelectorAll('.modal > div');
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            modals.forEach(modal => {
                modal.style.backgroundColor = isDark ? 'var(--card-bg)' : 'var(--background-color)';
                modal.style.color = isDark ? 'var(--text-color)' : '#111827';
            });
        }
    }

    // Initialize dark mode when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        initializeDarkMode();
    });

    // Make toggleDarkMode globally accessible by adding it to the window object
    window.toggleDarkMode = function() {
        const body = document.body;
        const toggleButton = document.querySelector('[onclick="toggleDarkMode()"]');
        const toggleText = toggleButton.querySelector('.toggle-text');
        const toggleIcon = toggleButton.querySelector('i');
        
        body.classList.toggle('dark-mode');
        
        // Save preference
        const isDarkMode = body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        
        // Update button text and icon
        toggleText.textContent = isDarkMode ? 'Disable Dark Mode' : 'Enable Dark Mode';
        toggleIcon.className = isDarkMode ? 'fas fa-moon' : 'fas fa-sun';
        
        // Update UI elements
        updateStoreMap();
        updateModalBackgrounds();
        
        // Show feedback
        showToast(isDarkMode ? 'Dark mode enabled' : 'Light mode disabled');
    }

    // Function to update modal backgrounds
    function updateModalBackgrounds() {
        const modals = document.querySelectorAll('.modal > div');
        const isDark = document.body.classList.contains('dark-mode');
        modals.forEach(modal => {
            modal.style.backgroundColor = isDark ? '#1e1e1e' : '#ffffff';
            modal.style.color = isDark ? '#ffffff' : '#000000';
        });
    }

    // Initialize dark mode on page load
    document.addEventListener('DOMContentLoaded', () => {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        const toggleButton = document.querySelector('[onclick="toggleDarkMode()"]');
        const toggleText = toggleButton.querySelector('.toggle-text');
        const toggleIcon = toggleButton.querySelector('i');
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            toggleText.textContent = 'Disable Dark Mode';
            toggleIcon.className = 'fas fa-moon';
            updateStoreMap();
            updateModalBackgrounds();
        }
    });
});
