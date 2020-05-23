var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (curr) {
            sum += curr.value;
        });
        data.total[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        total: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };

    return {
        addItems: function (type, description, value) {
            var ID, newItem;
            if (data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;
            if (type === 'inc') {
                newItem = new Income(ID, description, value);
            }
            else if (type === 'exp') {
                newItem = new Expense(ID, description, value);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItems: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (curr) {
                return curr.id;
            });
            index = ids.indexOf(id);
            if (index !== -1)
                data.allItems[type].splice(index, 1);
        },
        test: function () {
            console.log(data);
        },
        calculateBudget: function () {
            calculateTotal('inc');
            calculateTotal('exp');
            data.budget = data.total.inc - data.total.exp;
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        getBudget: function () {
            return {
                incomeTotal: data.total.inc,
                expenseTotal: data.total.exp,
                totalBudget: data.budget,
                percentage: data.percentage,
            }
        },
    }

})();

var UIController = (function () {
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expressContainer: ".expenses__list",
        displayBgt: ".budget__value",
        income: ".budget__income--value",
        expense: ".budget__expenses--value",
        percentage: ".budget__expenses--percentage",
        container: ".container",
    };
    return {
        getinput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };
        },
        getDOMstrings: function () {
            return DOMstrings;
        },
        getItemList: function (obj, type) {
            var html, newElement, element;
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>';
            }
            else if (type === 'exp') {
                element = DOMstrings.expressContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn">   <i class="far fa-times-circle"></i></button></div></div></div>';
            }
            newElement = html.replace('%id%', obj.id);
            newElement = newElement.replace('%description%', obj.description);
            newElement = newElement.replace('%value%', obj.value);
            document.querySelector(element).insertAdjacentHTML("beforeend", newElement);
        },
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function (obj) {
            document.querySelector(DOMstrings.displayBgt).textContent = obj.totalBudget;
            document.querySelector(DOMstrings.income).textContent = obj.incomeTotal;
            document.querySelector(DOMstrings.expense).textContent = obj.expenseTotal;
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentage).textContent = '---';
            }
        }
    }
})();



var controller = (function (budgetCtrl, uiCtrl) {

    var setupEventListeners = function () {
        var DOM = uiCtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
    }

    var updateBudget = function () {
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        uiCtrl.displayBudget(budget);
    }

    var ctrlAddItem = function () {
        var input = uiCtrl.getinput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            var data = budgetCtrl.addItems(input.type, input.description, input.value);
            uiCtrl.getItemList(data, input.type);
            uiCtrl.clearFields();
            updateBudget();
        }
    }

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, id;
        itemId = (event.target.parentNode.parentNode.parentNode.parentNode.id);
        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);
        }
        budgetCtrl.deleteItems(type, id);
    }

    return {
        init: function () {
            console.log('Application start');
            uiCtrl.displayBudget({
                incomeTotal: 0,
                expenseTotal: 0,
                totalBudget: 0,
                percentage: -1,
            });
            setupEventListeners();
        }
    }
})(budgetController, UIController);

controller.init();