var budgetController = (function() {
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var MonthlyBudgets = function(month, totalBudget, percentage, id) {
		this.month = month;
		this.totalBudget = totalBudget;
		this.percentage = percentage;
		this.id = id;
	};

	var data = {
		allItems: {
			exp: [],
			inc: [],
		},
		totals: {
			exp: 0,
			inc: 0,
		},
		monthlyTotals: [],
		budget: 0,
		percentage: -1,
	};

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(cur => {
			sum += cur.value;
		});
		data.totals[type] = sum;
	};

	return {
		addItem: function(type, desc, val) {
			var newItem, ID;
			//create an ID if the ID is greater than 0 -  the last items ID + 1 (the ID itself, not index), if its not - ID = 0
			data.allItems[type].length > 0
				? (ID = data.allItems[type][data.allItems[type].length - 1].id + 1)
				: (ID = 0);
			// ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

			//add item based on type(income or expense)
			if (type === 'exp') {
				newItem = new Expense(ID, desc, val);
			} else if (type === 'inc') {
				// document.querySelector('.income').style.display = "initial"
				newItem = new Income(ID, desc, val);
			}

			//push item to its corresponding types array
			data.allItems[type].push(newItem);

			//return item for use by other modules

			return newItem;
		},

		calculateBudget: function() {
			//calculate the total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');
			// calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;
			//calculate the percentage of the income that we have spent if income is more than 0 .
			data.totals.inc > 0
				? (data.percentage = Math.round(
						(data.totals.exp / data.totals.inc) * 100
				  ))
				: (data.percentage = -1);

			//e.g: expense = 100 income = 300--300 / 100 = 0.3 (33.333333%)--0.3333333 * 100 and rounded to the nearest integer
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(currItem => {
				console.log(data.totals.inc);
				console.log(currItem);
				currItem.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {
			var allPercentages = data.allItems.exp.map(item => item.getPercentage());
			return allPercentages;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				percentage: data.percentage,
				totalIncome: data.totals.inc,
				totalExpenses: data.totals.exp,
			};
		},

		deleteBudgetItem: function(type, id) {
			var ids, index;

			ids = data.allItems[type].map(function(arrItem) {
				return arrItem.id;
			});

			index = ids.indexOf(id);

			return data.allItems[type].splice(index, 1);
		},

		CtrlAddMonthlyBudget: function(totalBudget, perc, month) {
			var obj = new MonthlyBudgets(month, totalBudget, perc, month);
			data.monthlyTotals.push(obj);
			console.log(obj);
			console.log('monthly budget added');
			UIController.addMonthlyItem(data);
		},

		testing: function() {
			console.log(data);
		},
	};
})();

var UIController = (function() {
	var DOMStrings = {
		type: '.add__type',
		description: '.add__description',
		value: '.add__value',
		addBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetDisplay: '.budget__value',
		budgetIncomeDisplay: '.budget__income--value',
		budgetExpensesDisplay: '.budget__expenses--value',
		budgetPercentageDisplay: '.budget__expenses--percentage',
		monthDisplay: '.budget__title--month',
		budgetItemContainer: '.container',
		listPercentageLabels: '.item__percentage',
		completeButton: '.complete__btn',
		monthlyBudgetContainer: '.month-budgets',
		incomeDisplay: '.income',
		expenseDisplay: '.expenses',
	};

	var nodeListForEach = function(list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};

	return {
		getDate: function() {
			var month;
			switch (new Date().getMonth()) {
				case 0:
					month = 'January';
					break;
				case 1:
					month = 'February';
					break;
				case 2:
					month = 'March';
					break;
				case 3:
					month = 'April';
					break;
				case 4:
					month = 'May';
					break;
				case 5:
					month = 'June';
					break;
				case 6:
					month = 'July';
					break;
				case 7:
					month = 'August';
					break;
				case 8:
					month = 'September';
					break;
				case 9:
					month = 'October';
					break;
				case 10:
					month = 'November';
					break;
				case 11:
					month = 'December';
					break;
				default:
					month = 'Error';
			}
			console.log(month);
			this.setDate(month);
		},

		setDate: function(month) {
			document.querySelector(DOMStrings.monthDisplay).textContent = month;
		},

		getInputs: function() {
			return {
				inputType: document.querySelector(DOMStrings.type).value, // will be inc(income) or exp(expense)
				inputDescription: document.querySelector(DOMStrings.description).value,
				inputValue: parseFloat(document.querySelector(DOMStrings.value).value),
			};
		},
		getDOMStrings: function() {
			return DOMStrings;
		},

		addListItem: function(obj, type) {
			var html, element;
			if (type === 'inc') {
				//Initialises element as the INCOME CONTAINER and adds HTML income list element into it
				element = DOMStrings.incomeContainer;
				html = `<div class="item clearfix" id="inc-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">$${obj.value}</div><div class="item__delete"><button class="item__delete--btn">x</button></div></div></div>`;
			} else if (type === 'exp') {
				//Initialises element as the EXPENSES CONTAINER and adds HTML expenses list element into it
				element = DOMStrings.expensesContainer;
				html = `<div class="item clearfix" id="exp-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">- $${obj.value}</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn">x</button></div></div></div>`;
			}
			document.querySelector(element).insertAdjacentHTML('beforeend', html);
		},

		clearUI: function() {
			var inputFields, displays;
			inputFields = [
				...document.querySelectorAll(
					`${DOMStrings.description}, ${DOMStrings.value}`
				),
			];
			//clears input fields
			inputFields.forEach(function(currentItem) {
				currentItem.value = '';
			});
			//Places focus on the description field
			inputFields[0].focus();

			//clears UI
			displays = [
				...document.querySelectorAll(
					DOMStrings.budgetIncomeDisplay +
						', ' +
						DOMStrings.budgetExpensesDisplay +
						', ' +
						DOMStrings.budgetPercentageDisplay +
						', ' +
						DOMStrings.budgetDisplay
				),
			];
			displays.forEach(item => (item.textContent = 0));
		},

		addMonthlyItem: function(obj) {
			var html, index, splitNum, val;
			//finds index of an object containing the property (month) containing matching text to the current displayed month
			index = obj.monthlyTotals.findIndex(
				obj =>
					obj.id === document.querySelector(DOMStrings.monthDisplay).textContent
			);

			splitNum = obj.monthlyTotals[index].totalBudget.split('$');
			val = parseInt(splitNum.pop());

			html = `<div class="month" id="month-${obj.monthlyTotals[index].id}">
      ${obj.monthlyTotals[index].month}<span class="month__total-budget">${
				val > 0 ? `+ $${val}` : `- $${val}`
			}</span>
      <span class="item__percentage">${
				obj.monthlyTotals[index].percentage
			}</span></div>`;

			document
				.querySelector(DOMStrings.monthlyBudgetContainer)
				.insertAdjacentHTML('beforeend', html);

			this.clearUI();
		},

		getMonthlyBudget: function() {
			var totalBudget, budgetPercentage, month;
			totalBudget = document.querySelector(DOMStrings.budgetDisplay)
				.textContent;
			budgetPercentage = document.querySelector(
				DOMStrings.budgetPercentageDisplay
			).textContent;
			month = document.querySelector(DOMStrings.monthDisplay).textContent;
			budgetController.CtrlAddMonthlyBudget(
				totalBudget,
				budgetPercentage,
				month
			);
		},
		clearFields: function() {
			//selects input fields and pushes them into an array with the spread operator
			var fields = [
				...document.querySelectorAll(
					`${DOMStrings.description}, ${DOMStrings.value}`
				),
			];

			//resets the values of each input field
			fields.forEach(function(currentItem) {
				currentItem.value = '';
			});
			//Places focus on the description field
			fields[0].focus();
		},

		displayBudget: function(obj) {
			//if budget is greater than 0 add a plus sign to the left
			obj.budget > 0
				? (document.querySelector(
						DOMStrings.budgetDisplay
				  ).textContent = `+ $${obj.budget}`)
				: (document.querySelector(
						DOMStrings.budgetDisplay
				  ).textContent = `$${obj.budget}`);

			document.querySelector(DOMStrings.budgetIncomeDisplay).textContent =
				obj.totalIncome;
			document.querySelector(DOMStrings.budgetExpensesDisplay).textContent =
				obj.totalExpenses;

			//if the percentage is less than 0 and total budget display is less than 0 display '---' instead of a percentage
			obj.percentage > 0 && obj.budget > 0
				? (document.querySelector(
						DOMStrings.budgetPercentageDisplay
				  ).textContent = `${obj.percentage}%`)
				: (document.querySelector(
						DOMStrings.budgetPercentageDisplay
				  ).textContent = '---');
		},

		deleteUIItem: function(id) {
			var el = document.getElementById(id);
			el.parentNode.removeChild(el);
		},

		updatePercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMStrings.listPercentageLabels);

			nodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},

		changeInputFocusColour: function() {
			var inputFields = document.querySelectorAll(
				DOMStrings.value +
					', ' +
					DOMStrings.description +
					', ' +
					DOMStrings.type
			);

			nodeListForEach(inputFields, function(cur) {
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMStrings.addBtn).classList.toggle('red');
		},

		changeVisibleBudgetContainer: function(bdgtType) {
			const income = document.querySelector(DOMStrings.incomeDisplay);
			const expense = document.querySelector(DOMStrings.expenseDisplay);
			const state = {
				incVisible: true,
				expVisible: false,
			};
			if (bdgtType === 'inc') {
				state.incVisible = true;
				state.expVisible = false;
			} else {
				state.expVisible = true;
				state.incVisible = false;
			}

			state.incVisible === true
				? (income.style.opacity = 1)
				: (income.style.opacity = 0);
			state.expVisible === true
				? (expense.style.opacity = 1)
				: (expense.style.opacity = 0);
		},

		// 	storeLocally: () => {
		// 		let budget = budgetController.getBudget();
		// 		Object.entries(budget).forEach(arr => {
		// 			let key = arr[0];
		// 			let val = arr[1];
		// 			controller.myStorage.setItem(key, val);
		// 		});
		// 	},
	};
})();

var controller = (function(budgetCtrl, UICtrl) {
	// let myStorage = window.localStorage;
	var setupEventListeners = function() {
		var DOM = UIController.getDOMStrings();

		document.querySelector(DOM.type).addEventListener('change', e => {
			console.log(e.target.value);
			UICtrl.changeVisibleBudgetContainer(e.target.value);
			UICtrl.changeInputFocusColour;
		});
		document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);
		document.addEventListener('keydown', function(event) {
			if (event.keycode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		document
			.querySelector(DOM.budgetItemContainer)
			.addEventListener('click', ctrlDeleteItem);
	};

	var calculateBudget = function() {
		// 1. calculate the budget
		budgetCtrl.calculateBudget();
		//2. return the budget
		var budget = budgetCtrl.getBudget();

		//3. Display the budget on the UI
		UICtrl.displayBudget(budget);

		// //4. store in local storage
		// UICtrl.storeLocally();
	};

	var updatePercentages = function() {
		//1. calculate percentages

		budgetController.calculatePercentages();
		//2. read percentages from budget controller
		var percs = budgetController.getPercentages();
		//3. update the UI with new percentages
		UIController.updatePercentages(percs);
	};

	var ctrlAddItem = function() {
		var input, newItem;
		//1. receive input values
		input = UIController.getInputs();

		if (
			input.inputDescription !== '' &&
			!isNaN(input.inputValue) &&
			input.inputValue > 0
		) {
			//2. add the item to the budget controller
			newItem = budgetCtrl.addItem(
				input.inputType,
				input.inputDescription,
				input.inputValue
			);
			//3. add the item to the ui
			UICtrl.addListItem(newItem, input.inputType);
			//4. Clear the input fields
			UICtrl.clearFields();
			//5. initialise budget calculator
			calculateBudget();
			//6. calculate and update percentages
			updatePercentages();
		}
	};

	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.id;

		if (itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			//1 - delete the item from the data structure
			budgetCtrl.deleteBudgetItem(type, ID);
			//2 - delete the item from the UI
			UICtrl.deleteUIItem(itemID);
			//3 - update and show the new budget
			calculateBudget();
			//4. calculate and update percentages
			updatePercentages();
		}
	};

	// getLocalStorageItems = () => {};

	return {
		initialiseApp: function() {
			console.log('App has been initialised');
			UICtrl.getDate();
			UICtrl.displayBudget({
				budget: 0,
				percentage: -1,
				totalIncome: 0,
				totalExpenses: 0,
			});
			// getLocalStorageItems();
			setupEventListeners();
		},
		// myStorage,
	};
})(budgetController, UIController);

controller.initialiseApp();
