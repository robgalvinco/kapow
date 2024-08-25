// This function will automatically change the purchase url to apply a coupon
// and will also change all text that contains the price to a strikethrough with a new price

$(document).ready(function() {
    if (typeof(Thinkific.current_user) !== "undefined" && Thinkific.current_user.groups.length > 0) {
        var Coupons = [
            {
                group: "AFFILIATE PARTNER EXAMPLE",
                coupon: "aff20",
                originalPrice: "129.00",
                discountedPrice: "109"
            },
            {
                group: "group two",
                coupon: "coupon-two",
                originalPrice: "150.00",
                discountedPrice: "120.00"
            }
        ];

        var userGroups = Thinkific.current_user.groups.map(function(group) {
            return group.name;
        });

        console.log("User Groups:", userGroups);

        var matchingCoupon = null;
        var originalPrice = null;
        var discountedPrice = null;

        for (var i = 0; i < Coupons.length; i++) {
            console.log("Checking group:", Coupons[i].group);
            if (userGroups.includes(Coupons[i].group)) {
                matchingCoupon = Coupons[i].coupon;
                originalPrice = Coupons[i].originalPrice;
                discountedPrice = Coupons[i].discountedPrice;
                break;
            }
        }

        console.log("Matching Coupon:", matchingCoupon);

        if (matchingCoupon) {
            // Update the enroll links
            $('a[href*="/enroll/"]').each(function() {
                var href = $(this).attr('href');
                if (href.indexOf('?') === -1) {
                    // No query parameters present
                    href += '?coupon=' + matchingCoupon;
                } else {
                    // Query parameters present
                    href += '&coupon=' + matchingCoupon;
                }
                $(this).attr('href', href);
            });

            // Update the prices
            console.log("Looking for price: $" + originalPrice);
            $('body').find('*:contains("$' + originalPrice + '")').each(function() {
                var $this = $(this);
                var text = $this.text().trim();
                console.log("Found text:", text);
                if ($this.children().length === 0 && text.includes('$' + originalPrice)) {
                    console.log("Changing price");
                    var newHtml = text.replace('$' + originalPrice, '$' + discountedPrice + ' (<i style="text-decoration: line-through;font-size: initial;">$' + originalPrice + '</i>)');
                    $this.html(newHtml);
                }
            });
        }
    }
});
