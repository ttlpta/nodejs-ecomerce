var aptCategoriesHelper = angular.module('aptCategoriesHelper', []);
aptCategoriesHelper.factory('catService', ['$resource', function ($resource) {
    return $resource('/categories', {}, {
        query: {
            method: 'GET',
            params: {
                action: 'listCat'
            },
            isArray: true
        }
    });
}]).service('urlSlugService', function () {
    this.toUrlSlug = function (s, opt) {
        s = String(s);
        opt = Object(opt);
        s = s.toLowerCase();
        var defaults = {
            'delimiter': '-',
            'limit': undefined,
            'lowercase': true,
            'transliterate': (typeof(XRegExp) === 'undefined') ? true : false
        };

        // Merge options
        for (var k in defaults) {
            if (!opt.hasOwnProperty(k)) {
                opt[k] = defaults[k];
            }
        }

        var char_map = {
            // Vietnamense characters
            'à': 'a', 'á': 'a', 'ã': 'a', 'ạ': 'a', 'ả': 'a',
            'â': 'a', 'ấ': 'a', 'ẫ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ầ': 'a',
            'ă': 'a', 'ắ': 'a', 'ẵ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ằ': 'a',
            'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'è': 'e',
            'ê': 'e', 'ế': 'e', 'ễ': 'e', 'ệ': 'e', 'ể': 'e', 'ề': 'e',
            'ì': 'i', 'í': 'i', 'ĩ': 'i', 'ị': 'i', 'ỉ': 'i',
            'ò': 'o', 'ó': 'o', 'õ': 'o', 'ỏ': 'o', 'ọ': 'o',
            'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ộ': 'o', 'ỗ': 'o',
            'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ỡ': 'o', 'ợ': 'o', 'ở': 'o',
            'ù': 'u', 'ủ': 'u', 'ú': 'u', 'ụ': 'u', 'ũ': 'u',
            'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
        };
        // Transliterate characters to ASCII
        if (opt.transliterate) {
            for (var k in char_map) {
                s = s.replace(RegExp(k, 'g'), char_map[k]);
            }
        }

        // Replace non-alphanumeric characters with our delimiter
        var alnum = (typeof(XRegExp) === 'undefined') ? RegExp('[^a-z0-9]+', 'ig') : XRegExp('[^\\p{L}\\p{N}]+', 'ig');
        s = s.replace(alnum, opt.delimiter);

        // Remove duplicate delimiters
        s = s.replace(RegExp('[' + opt.delimiter + ']{2,}', 'g'), opt.delimiter);

        // Truncate slug to max. characters
        s = s.substring(0, opt.limit);

        // Remove delimiter from ends
        s = s.replace(RegExp('(^' + opt.delimiter + '|' + opt.delimiter + '$)', 'g'), '');

        return s;
    }
});