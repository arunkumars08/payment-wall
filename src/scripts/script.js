var MockBackend = {
    send: function(payment) {
        var promise = new Promise(function(resolve, reject) {
            if (payment && payment['cvv'] === '123') {
                reject('CVV is wrong');
            } else {
                resolve('Payment processed successfully');
            }
        });
        return promise;
    }
};

var KEY = '025eb95322241fe53a4086ef1c060f1f';
var paymentNode = document.querySelector('#paymentMethod');
var paymentMethodsContainer = document.querySelector('.payment-method');

var PaymentWidget = (function(MockBackend) {

    var Message = {
        identification: 'payment-message',
        showBanner: function(type, message) {
            var banner = Node.byClass('payment-message-banner')[0];
            if (banner.classList && banner.classList.contains('hide')) {
                banner.classList.remove('hide')
            }
            if (banner.classList && banner.classList.contains('success-banner')) {
                banner.classList.remove('success-banner')
            }
            if (banner.classList && banner.classList.contains('error-banner')) {
                banner.classList.remove('error-banner')
            }

            switch(type) {
                case 'success':
                    banner.classList.add('success-banner');
                    break;
                case 'error':
                    banner.classList.add('error-banner');
                    break;
            }

            banner.innerHTML = message;
            setTimeout(function() {
                banner.classList.add('hide');
            }, 2000);
        },
        show: function(type, parent, message) {
            this.hide(parent.querySelector('.' + this.identification));
            var classToAdd = 'success';
            if (!type) {
                return;
            }
            switch(type) {
                case 'error':
                    classToAdd = 'error';
                    break;
            }
            var node = Node.create('div', {
                class: [this.identification, classToAdd]
            });
            node.innerHTML = message;
            Node.append(parent, node);
        },
        hide: function(selector) {
            if (!selector) return;

            selector.parentNode.removeChild(selector);
        },
        hideAll: function() {
            var arr = Array.prototype.slice.call(Node.byClass(this.identification));
            debugger;
            while(arr.length) {
                (function () {
                    this.hide(arr.pop());
                }.bind(this))();
            }
            arr.length = 0;
        }
    };

    var ValidateCreditCard = {
        name: function(name) {
            return !this.isEmpty(name) && /^([a-zA-Z ])+$/.test(name);
        },
        onlyNumbers: function(value) {
            return value && /^([0-9])+$/.test(value);
        },
        isEmpty: function(value) {
            return !(value && value.toString().trim() !== '');
        },
        cvv: function(value) {
            return this.onlyNumbers(value);
        },
        expiration: function(month, year) {
            if (!this.isEmpty(month) && !this.isEmpty(year)) {
                if (!this.onlyNumbers(month) || !this.onlyNumbers(year)) {
                    return false;
                }
                var convM = parseInt(month, 10);
                var convY = parseInt(year, 10);

                if (convM < 1 || convM > 12) {
                    return false;
                }
                var current = new Date();
                var last2Y = current.getFullYear() % 100;
                var last2M = current.getMonth();

                if (convY >= last2Y) {
                    if (convY === last2Y) {
                        if (convM - 1 <= last2M) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            }
            return false;
        },
        creditNumber: function(number) {
            if (/^([0-9]{16})+$/.test(number)) {
                number = number.toString();
                var sum = 0;
                for (var i = 0; i < number.length; ++ i) {
                    var single = parseInt(number.substr(i, 1), 10);;
                    if (i % 2 == 0) {
                        single *= 2;
                        if (single > 9) {
                            single = 1 + (single % 10);
                        }
                    }
                    sum += single;
                }
                return (sum % 10) === 0;
            }
            return false;
        }
    };

    var PaymentWidget = function (amount) {
        if (amount && amount.indexOf(' ') !== -1) {
            var split = amount.split(' ');
            this.amount = Number(split[0]);
            this.currency = split[1];
        }
        this.paymentMethods = [];
        this.step = 0;
        this.path = {
            0: {
                header: 'Select Payment Method',
                validator: 'payment'
            },
            1: {
                header: 'Checkout with ',
                validator: 'credit'
            }
        };
        this.updateScreen();
    }

    var paymentWidgetPrototypes = {
        paymentBaseUrl: 'https://api.paymentwall.com/api/',
        paymentMethodsContainer: null,
        creditNumberReset: 'XXXX&emsp;&emsp;XXXX&emsp;&emsp;XXXX&emsp;&emsp;XXXX',
        cardHolder: 'CARDHOLDER NAME',
        expMonth: 'MM',
        expYear: 'YY',
        init: function() {
            this.getPaymentMethods();
            this.handleEvents();
        },
        handleEvents: function() {
            Node.listen('click', Node.byClass('back-arrow')[0], function(e) {
                if (this.step === 0) {
                    return;
                } else {
                    this.step --;
                    this.updateScreen();
                }
            }.bind(this));

            Node.listen('click', Node.byClass('payment-container')[0], function(e) {
                if (e.target.id === 'paymentBtn') {
                    this.submitPayment();
                }
            }.bind(this));
        },
        hideLoader: function() {
            Node.byClass('loader')[0].classList.add('hide');
        },
        displayPaymentMethods: function() {
            this.hideLoader();
            function setPaymentData(id, data, node) {
                node.setAttribute('data-id', id)
                node.querySelector('img').setAttribute('src', data['img_url']);
                node.querySelector('figcaption').innerHTML = data['name'];
                return node;
            }
            if(this.paymentMethods && this.paymentMethods.length > 0) {
                var paymentElement = null;
                var frag = document.createDocumentFragment();
                this.paymentMethods.forEach(function(payment, i) {
                    var node = document.importNode(Node.byId('paymentMethod').content.firstElementChild, true);
                    frag.appendChild(setPaymentData(i, payment, node));
                });
                this.paymentMethodsContainer.appendChild(frag);
            }
        },
        getFullURL: function(url, config) {
            url += '?key=' + KEY + '&';
            if (!config) {
                return url;
            }
            for (var i in config) {
                if (config.hasOwnProperty(i)) {
                    url += i + '=' + config[i] + '&';
                }
            }
            return url.substring(0, appendString.length - 1);
        },
        updatePaymentHeader: function(title) {
            Node.byClass('payment-header')[0].querySelector('.payment-title').innerHTML = title;
        },
        updateScreen: function() {
            Node.removeAllClass('.payment-screens', 'active-screen');
            Node.addClass(Node.byClass('payment-screens')[this.step], 'active-screen');
            Node.byClass('back-arrow')[0].style.display = 'none';
            var title = this.path[0].header;
            if (this.step !== 0) {
                Node.byClass('back-arrow')[0].style.display = 'inline-block';
                debugger;
                title = this.path[this.step].header + 'with ' + this.path[0].selectedPayment.name;
                this.updatePaymentButton();
            } else {

            }
            this.updatePaymentHeader(title);
        },
        goNext: function() {
            this.step ++;
            this.updateScreen();
        },
        updatePaymentButton: function() {
            if (this.step === 1) {
                Node.byClass('payment-btn')[0].innerHTML = 'Pay ' + this.amount + ' ' + this.currency;
            }
        },
        validatePaymentInformation: function(paymentConfig) {
            if (!paymentConfig) {
                return false;
            }
            var flag = true;
            Message.hideAll();
            if (!ValidateCreditCard.name(paymentConfig['name'].value)) {
                Message.show('error', paymentConfig['name'].node.parentNode, 'Name should contain only alphabets');
                flag = false;
            }
            if (!ValidateCreditCard.creditNumber(paymentConfig['number'].value)) {
                Message.show('error', paymentConfig['number'].node.parentNode, 'Not a valid credit card number');
                flag = false;
            }
            if (!ValidateCreditCard.expiration(paymentConfig['month'].value, paymentConfig['year'].value)) {
                Message.show('error', paymentConfig['month'].node.parentNode, 'Not a valid expiration date');
                flag = false;
            }
            if (!ValidateCreditCard.cvv(paymentConfig['cvv'].value)) {
                Message.show('error', paymentConfig['cvv'].node.parentNode, 'Only valid numbers');
                flag = false;
            }
            return flag;
        },
        getCardHolder: function() {
            return Node.byId('cardHolderName');
        },
        getCardNumber: function() {
            return Node.byId('cardNumber');
        },
        getCVV: function() {
            return Node.byId('cvv');
        },
        getExpMonth: function() {
            return Node.byId('expDateMonth');
        },
        getExpYear: function() {
            return Node.byId('expDateYear');
        },
        submitPayment: function() {
            var name = this.getCardHolder();
            var number = this.getCardNumber();
            var month = this.getExpMonth();
            var year = this.getExpYear();
            var cvv = this.getCVV();

            var info = {
                name: name.value,
                number: number.value,
                month: month.value,
                year: year.value,
                cvv: cvv.value
            };

            debugger;
            if (this.validatePaymentInformation({
                name: {
                    value: info['name'],
                    node: name
                },
                number: {
                    value: info['number'],
                    node: number
                },
                month: {
                    value: info['month'],
                    node: month
                },
                year: {
                    value: info['year'],
                    node: year
                },
                cvv: {
                    value: info['cvv'],
                    node: cvv
                }
            })) {
                MockBackend.send(info).then(function(response) {
                    Message.showBanner('success', response);
                    setTimeout(function() {
                        this.removeSelectedMethods();
                        this.resetForm();
                        this.step = 0;
                        this.updateScreen();
                    }.bind(this), 2000);
                }.bind(this)).catch(function(err) {
                    Message.showBanner('error', err);
                });
            }
        },
        resetField: function(field, def) {
            def = def || '';
            if(!field) {
                return;
            }
            if(field.value) {
                field.value = def;
            } else {
                field.innerHTML = def;
            }
        },
        resetForm: function() {
            this.resetField(this.getCardHolder());
            this.resetField(this.getCardNumber());
            this.resetField(this.getExpMonth());
            this.resetField(this.getExpYear());
            this.resetField(this.getCVV());

            this.resetField(Node.byClass('card-number')[0], this.creditNumberReset);
            this.resetField(Node.byClass('card-expiration')[0].children[0], this.expMonth);
            this.resetField(Node.byClass('card-expiration')[0].children[1], this.expYear);
            this.resetField(Node.byClass('card-name')[0], this.cardHolder);
        },
        removeSelectedMethods: function() {
            Node.removeAllClass('.payment-screen-list-item', 'selected-method');
        },
        getPaymentMethods: function(config) {
            this.paymentMethodsContainer = document.querySelector('.payment-methods');
            Node.listen('click', this.paymentMethodsContainer, function(e) {
                var listItem = Node.closest(e.target, '.payment-screen-list-item');
                this.removeSelectedMethods();
                Node.addClass(listItem, 'selected-method');
                this.path[this.step]['selectedPayment'] = this.paymentMethods[listItem.getAttribute('data-id')];
                this.goNext();
            }.bind(this));
            this.updatePaymentHeader(this.path[this.step].header);
            var url = this.getFullURL(this.paymentBaseUrl + 'payment-systems/', config);
            var paymentMethods = Ajax.get(url, null, function(response) {
                this.paymentMethods = response;
                this.displayPaymentMethods();
            }.bind(this));
        }
    }

    Object.assign(PaymentWidget.prototype, paymentWidgetPrototypes);
    return PaymentWidget;
})(MockBackend);

window.onload = init();

function init() {
    var currencyString = '1000 PLN';
    var paymentWidget = new PaymentWidget(currencyString);
    paymentWidget.init();
}
