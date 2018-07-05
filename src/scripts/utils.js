var Utils = {
    designCreditNumber: function (number) {
        number = number.toString();
        var result = '';
        var i = 0;
        while (i < 4) {
            result += this.assignPadding(number.substring(i * 4, (i + 1) * 4)) + (i !== 3 ? '&emsp;&emsp;' : '');
            ++ i;
        }
        return result;
    },
    assignPadding: function(value) {
        for (var i = value.length; i < 4; ++ i) {
            value += 'X';
        }
        return value;
    }
};
