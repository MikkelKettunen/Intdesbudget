(function () {
    "use strict";
    var wizardPage = 0;

    function wizardPageExists(page) {
        return $("#add-wizard-page" + page).length !== 0;
    }
    
    function addPost(post) {
        $("#budget-body").append("<tr><td>" + post.post + "</td><td>" + post.amount + "</td><td>" + formatDate(post.startDate) + "</td></tr>");
    }
    
    function updateWizardPage(callFinished) {
        if (callFinished) {
            var pageFinished = "page" + wizardPage + "finished";
            if (pageFinished in window.interface) {
                var error = window.interface[pageFinished]();
                if (error) {
                    $("#modal-error").text(error);
                    return;
                }
            }
        }
        
        // Var det her sidste side?
        if (!wizardPageExists(wizardPage + 1)) {
            addPost(window.interface.addPost);
            $("#wizard-modal").modal("hide");
            return;
        }
        
        $("#modal-error").text("");
        wizardPage++;
        var templ = $("#add-wizard-page" + wizardPage);
        $("#wizard-modal .modal-body").html(templ.html());
        $("#wizard-modal .modal-title").html(templ.attr("data-title"));
        
        // Skifter vi til sidste side?
        if (!wizardPageExists(wizardPage + 1)) {
            // Udskift ikon på "færdiggør" knap
            $("#wizard-next span").removeClass("glyphicon-circle-arrow-right glyphicon-ok").addClass("glyphicon-ok");
        }
        else {
            $("#wizard-next span").removeClass("glyphicon-ok glyphicon-circle-arrow-right").addClass("glyphicon-circle-arrow-right");
        }

        var pageOnloaded = "page" + wizardPage + "loaded";
        if (pageOnloaded in window.interface)
            window.interface[pageOnloaded]();
    }
    
    $("#wizard-modal").on("show.bs.modal", function(e) {
        window.interface.addPost = {};
        wizardPage = 0;
        updateWizardPage(false);
    });
    
    $("#wizard-next").click(function() {
        updateWizardPage(true);
    });
    
    window.interface = {};
    
    window.interface.onSelectedType = function(select) {
        var selected = select.options[select.selectedIndex];
        $("#selected-info").html($(selected).attr("data-info"));
    };
    
    window.interface.page1loaded = function() {
        $("#select-post").trigger("onchange");
    };
    
    window.interface.page1finished = function() {
        var select = $("#select-post")[0];
        window.interface.addPost.post = select.options[select.selectedIndex].text;
    };
    
    window.interface.page2loaded = function() {
        var date = $("#input-date");
        date.datepicker({
            showOn: "button",
            buttonImage: "//jqueryui.com/resources/demos/datepicker/images/calendar.gif",
        });
        date.datepicker("option", "dateFormat", "dd-mm-yy");
        date.datepicker("setDate", new Date());
    };
    
    window.interface.page2finished = function() {
        var select = $("#select-interval")[0];
        window.interface.addPost.interval = select.options[select.selectedIndex].value;
        console.log(window.interface.addPost.interval);
        
        window.interface.addPost.startDate = $("#input-date").datepicker("getDate");
    };
    
    window.interface.page3finished = function() {
        var value = $("#input-amount").val();
        if (!value || value.length == 0)
            return "Indtast et beløb";
        
        window.interface.addPost.amount = value;
        console.log(window.interface.addPost.amount);
    };
    
    window.interface.page4loaded = function() {
        $("#finish-post").text(window.interface.addPost.post);
        
        var betalingsIntervaller = {
            "yearly": "årlig betaling",
            "halfyearly": "halvårlig betaling",
            "every4months": "betaling hver 4 måned",
            "quarterly": "kvartalvis betaling",
            "monthly": "månedlig betaling",
            "once": "engangsbetaling"
        };

        $("#finish-interval").text(betalingsIntervaller[window.interface.addPost.interval]);
        var paymentDate = window.interface.addPost.startDate;

        $("#finish-date").text(formatDate(paymentDate));
        $("#finish-price").text(window.interface.addPost.amount);
    };
    
    function formatDate(date) {
        var monthNames = [ "januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december" ];
        
        var formatted = date.getDate() + ". " + monthNames[date.getMonth()] + " " + date.getFullYear();
        return formatted;
    }
})();