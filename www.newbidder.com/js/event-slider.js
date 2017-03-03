jQuery(document).ready(function($) {
    $("#eventsSlider").slider({
        from: 1,
        step: 1,
        to: 100000000,
        round: 0,
        heterogeneity: ['33/1000000', '66/25000000'],
        limits: false,
        onstatechange: function( value ){
            jQuery('.blueSlider .jslider-bg .l').css('width', jQuery('.eventsSliderBox .jslider-pointer').css('left'));
            jQuery('.eventsSliderNumber').val(value);
            jQuery('.eventsSliderNumber').formatNumber({format:"#,###", locale:"us"});
            calculateCosts(value);
        }
    })
});

jQuery('.eventsSliderNumber').on('change', function(){
    actualVal = parseInt(jQuery(this).val().replace(/,/g, ''));
    if ( actualVal > 100000000  ) {
        actualVal = 100000000;
    }
    jQuery("#eventsSlider").slider("value", parseFloat(actualVal));
    jQuery('.eventsSliderNumber').val(actualVal);
    jQuery('.eventsSliderNumber').formatNumber({format:"#,###", locale:"us"});
    calculateCosts(parseInt(actualVal));
})

var noobiePrice = 0;
var proPrice = 89;
var agencyPrice = 299;
var superPrice = 899;

var proMoreEvents = 0.000035;
var agencyMoreEvents = 0.00003;
var superMoreEvents = 0.000025;

function calculateSingleCost(val, eventsIncluded, standardCost, overageCost, plan) {
    overagesEvents = (val - eventsIncluded);
    if (overagesEvents < 0) {
        overagesEvents = 0;
    }
    overagesCost = overagesEvents * overageCost;

    return {
        totalCost: standardCost + overagesCost,
        overagesCost: overagesCost,
        prepayCost: standardCost,
        overagesEvents: overagesEvents,
        includedEvents: eventsIncluded,
        plan: plan
    };
}

function calculateCosts(val) {
    var costs = [
        calculateSingleCost(val, 1000000, proPrice, proMoreEvents, 'PRO'),
        calculateSingleCost(val, 10000000, agencyPrice, agencyMoreEvents, 'AGENCY'),
        calculateSingleCost(val, 30000000, superPrice, superMoreEvents, 'ENTERPRISE')
    ];

    var bestPlan = costs.reduce(function(prev, current) {
        return (prev.totalCost < current.totalCost) ? prev : current
    });

    displayCalculatedPlanData(bestPlan);
}

function displayCalculatedPlanData(plan) {
    jQuery('.overagesEvents').html(plan.overagesEvents);
    if (plan.overagesEvents > 0) {
        jQuery('.overagesEvents').formatNumber({format: "#,###", locale: "us"});
    }

    jQuery('.mainPrice, .mainPriceLittle').html(plan.totalCost.toFixed(0));
    jQuery('.prepay').html(plan.prepayCost);
    jQuery('.overages').html(plan.overagesCost.toFixed(0));
    jQuery('.plan').html(plan.plan);


    jQuery('.includedEvents').html(plan.includedEvents);
    jQuery('.includedEvents').formatNumber({format:"#,###", locale:"us"});
}