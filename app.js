var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    Expense.prototype.calcPercentage = function (totalInc) {
        if (totalInc > 0)
            this.percentage = Math.round((this.value / totalInc) * 100);
        else
            this.percentage = -1;
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
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
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (curr) {
                curr.calcPercentage(data.total.inc);
            })
        },
        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (curr) {
                return curr.getPercentage();
            });
            return allPerc;
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
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month",
    };
    var formatNumber = function (num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if (int.length > 3)
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;
    };
    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
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
            newElement = newElement.replace('%value%', formatNumber(obj.value, type));
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
            var type;
            obj.totalBudget >= 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.displayBgt).textContent = formatNumber(obj.totalBudget, type);
            document.querySelector(DOMstrings.income).textContent = formatNumber(obj.incomeTotal,'inc');
            document.querySelector(DOMstrings.expense).textContent = formatNumber(obj.expenseTotal,'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentage).textContent = '---';
            }
        },
        deleteItem: function (selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        displayPercentages: function (percentage) {
            var fields
            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
        
            nodeListForEach(fields, function (current, index) {
                if (percentage[index] > 0)
                    current.textContent = percentage[index] + '%';
                else
                    current.textContent = '---';
            });
        },
        date: function(){
            var now,months,month,year;
            now = new Date();
            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
        },
        changeType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            nodeListForEach(fields, function(curr){
                curr.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
    }
})();



var controller = (function (budgetCtrl, uiCtrl) {

    var setupEventListeners = function () {
        var DOM = uiCtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeType);
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
            updatePercentage();
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
        uiCtrl.deleteItem(itemId);
        updateBudget();
        updatePercentage();
    }

    var updatePercentage = function () {
        budgetCtrl.calculatePercentages();
        var percentage = budgetCtrl.getPercentages();
        uiCtrl.displayPercentages(percentage);
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
            uiCtrl.date();
        }
    }
})(budgetController, UIController);

controller.init();