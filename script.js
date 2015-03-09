(function () {
    "use strict";
    var wizardPage = 0;

    function wizardPageExists(page) {
        return $("#add-wizard-page" + page).length !== 0;
    }
    function updateTotal(post) {
        var latest = Number($("#total").text());
       $("#total").text(latest - Number(post.amount));
    }
    
    function addPost(post) {
        $("#udgifter").closest("tr").after("<tr><td>" + post.post.postName + "</td><td>" + post.amount + "</td><td>" + formatDate(post.startDate) + "</td></tr>");
        //$("#budget-body").append("<tr><td>" + post.post.postName + "</td><td>" + post.amount + "</td><td>" + formatDate(post.startDate) + "</td></tr>");
        updateTotal(post);
    }

    
    // previous will be set to true if we're going back
    function updateWizardPage(callFinished, previous) {
        previous = !!previous;
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
        if (!wizardPageExists(wizardPage + 1) && !previous) {
            addPost(window.interface.addPost);
            $("#wizard-modal").modal("hide");
            return;
        }
        
        $("#modal-error").text("");
        if (previous)
            wizardPage--;
        else 
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
        
        // vi kan ikke gå tilbage hvis vi er på sidste side
        if (!wizardPageExists(wizardPage-1)) {
            $("#wizard-prev").hide();
        } else {
            $("#wizard-prev").show();
        }

        var pageOnloaded = "page" + wizardPage + "loaded";
        if (pageOnloaded in window.interface)
            window.interface[pageOnloaded]();
        
        // opdater progress bar 
        var progress = (wizardPage-1)*(1/3)*100;
        $(".progress-bar").width(progress+"%");
    }
    
    
    $("#wizard-modal").on("show.bs.modal", function(e) {
        window.interface.addPost = {};
        wizardPage = 0;
        updateWizardPage(false);
    });
    
    $("#wizard-next").click(function() {
        updateWizardPage(true);
    });
    
    $("#wizard-prev").click(function() {
        updateWizardPage(false, true);
    });
    
    window.interface = {};
    
    window.interface.expenses = [
        {
            postName: "Indboforsikring",
            explanation: "En indboforsikring er en forsikring, der dækker dine ting.",
            average: "Andre bruger gennemsnitligt 1800 kr. årligt på indboforsikringer."
        },
        {
            postName: "Kaskoforsikring",
            explanation: "En kaskoforsikring dækker din bil hvis den går i stykker",
            average: "Andre bruger gennemsnitligt 7000 kr. årligt på kaskoforsikring",
        },
        {
            postName: "Mad",
            explanation: "",
            average: "Andre bruger gennemsnitligt 1572 kr. månedligt på mad."
        },
        {
            postName: "Motionscenter",
            explanation: "",
            average: "Andre bruger gennemsnitligt 150 kr. månedligt på fitnesscenter."
        },
        {
            postName: "Husleje",
            explanation: "",
            average: "Andre bruger gennemsnitligt 3000 kr. månedligt på husleje."
        },
        {
            postName: "Medielicens",
            explanation: "Hvis du ejer et elektronisk produkt skal du betale medielicens til DR",
            average: "Medielicens koster 1230 kr. hver halve år eller 205 kroner om måneden"
        },
        {
            postName: "Selvvalgt",
            explanation: "Skriv din udgift til højre",
            average: ""
        }
    ];
    
    window.interface.onSelectedType = function(select) {
        var selected = window.interface.expenses[select.selectedIndex];
        $("#selected-info").html(selected.explanation);
        
        if (selected.postName === "Selvvalgt")
            $("#select-post-custom").show();
        else
            $("#select-post-custom").hide();
    };
    
    window.interface.page1loaded = function() {
        $("#select-post").empty();
        for (var i = 0; i < window.interface.expenses.length; i++) {
            var expense = window.interface.expenses[i];
            $("#select-post").append("<option>" + expense.postName + "</option>");
        }
        
        $("#select-post").trigger("onchange");
    };
    
    window.interface.page1finished = function() {
        var select = $("#select-post")[0];
        var expense = window.interface.expenses[select.selectedIndex];
        if (expense.postName === "Selvvalgt") {
            window.interface.addPost.post = {
                postName: $("#select-post-custom").val(),
                explanation: "",
                average: ""
            };
        }
        else {
            window.interface.addPost.post = expense;
        }
    };
    
    window.interface.page2loaded = function() {
        var date = $("#input-date");
        date.datepicker({
            showOn: "button",
            buttonImage: "http://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
        });
        date.datepicker("option", "dateFormat", "dd-mm-yy");
        date.datepicker("setDate", new Date());
    };
    
    window.interface.page2finished = function() {        
        window.interface.addPost.startDate = $("#input-date").datepicker("getDate");
    };
    
    window.interface.page3loaded = function() {
        $("#selected-average").html(window.interface.addPost.post.average);
    };
    
    window.interface.page3finished = function() {        
        var value = $("#input-amount").val();
        if (!value || value.length == 0)
            return "Indtast et beløb";
        
        var select = $("#select-interval")[0];
        window.interface.addPost.interval = select.options[select.selectedIndex].value;
        
        window.interface.addPost.amount = value;
    };
    
    window.interface.page4loaded = function() {
        $("#finish-post").text(window.interface.addPost.post.postName);
        
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