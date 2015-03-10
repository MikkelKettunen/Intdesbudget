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
            $("#budget-empty-info").hide();
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
        
        // vi kan ikke gå tilbage hvis vi er på første side
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
        $(".progress-bar-text").text((wizardPage-1) + "/3");
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
            average: "Andre bruger gennemsnitligt 1800 kr. årligt på indboforsikringer.",
            custom: false
        },
        {
            postName: "Kaskoforsikring",
            explanation: "En kaskoforsikring dækker din bil hvis den går i stykker",
            average: "Andre bruger gennemsnitligt 7000 kr. årligt på kaskoforsikring",
            custom: false
        },
        {
            postName: "Mad",
            explanation: "",
            average: "Andre bruger gennemsnitligt 1572 kr. månedligt på mad.",
            custom: false
        },
        {
            postName: "Motionscenter",
            explanation: "",
            average: "Andre bruger gennemsnitligt 150 kr. månedligt på fitnesscenter.",
            custom: false
        },
        {
            postName: "Husleje",
            explanation: "",
            average: "Andre bruger gennemsnitligt 3000 kr. månedligt på husleje.",
            custom: false
        },
        {
            postName: "Medielicens",
            explanation: "Hvis du ejer et elektronisk produkt skal du betale medielicens til DR",
            average: "Medielicens koster 1230 kr. hver halve år eller 205 kroner om måneden",
            custom: false
        },
        {
            postName: "Selvvalgt",
            explanation: "Skriv din udgift til højre",
            average: "",
            custom: true
        }
    ];
    
    window.interface.onSelectedType = function(select) {
        var selected = window.interface.expenses[select.selectedIndex];
        $("#selected-info").html(selected.explanation);
        
        if (!selected.explanation)
            $(".glyphicon-info-sign").hide();
        else
            $(".glyphicon-info-sign").show();
        
        if (selected.postName === "Selvvalgt")
            $("#select-post-custom").show();
        else
            $("#select-post-custom").hide();
    };
    
    window.interface.onKeyPress = function(event) {
        if (event.which == 13) {
            // Enter pressed
            updateWizardPage(true);
        }
    };
    
    window.interface.page1loaded = function() {
        $("#select-post").empty();
        for (var i = 0; i < window.interface.expenses.length; i++) {
            var expense = window.interface.expenses[i];
            $("#select-post").append("<option>" + expense.postName + "</option>");
        }

        if (window.interface.addPost.post) {
            if (!window.interface.addPost.post.custom) {
                $("#select-post").val(window.interface.addPost.post.postName);
            } else {
                $("#select-post-custom").show();
                $("#select-post-custom").val(window.interface.addPost.post.postName);
                // hardcoded.. :(
                $("#select-post").val("Selvvalgt");
            }
        }
        
        $("#select-post").trigger("onchange");
        
        // This function is called from the show.bs.modal event, but
        // focusing will be removed as part of the modal launch.
        // Ideally we use the shown.bs.modal event, but let's just use a workaround
        // by focusing the select in 500 ms.
        setTimeout(function() { $("#select-post").focus(); }, 500);
    };
    
    window.interface.page1finished = function() {
        var select = $("#select-post")[0];
        var expense = window.interface.expenses[select.selectedIndex];
        if (expense.postName === "Selvvalgt") {
            window.interface.addPost.post = {
                postName: $("#select-post-custom").val(),
                explanation: expense.explanation,
                average: "",
                custom: true
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
        
        if (window.interface.addPost.startDate) {
            date.datepicker("setDate", new Date(window.interface.addPost.startDate));
        } 
        
        $("#input-date").select().focus();
    };
    
    window.interface.page2finished = function() {        
        window.interface.addPost.startDate = $("#input-date").datepicker("getDate");
    };
    
    window.interface.page3loaded = function() {
        $("#selected-average").html(window.interface.addPost.post.average);
        if (!window.interface.addPost.post.average)
            $(".glyphicon-info-sign").hide();
        else
            $(".glyphicon-info-sign").show();
        
        if (window.interface.addPost.amount) {
            $("#input-amount").val(window.interface.addPost.amount);
            $("#select-interval").val(window.interface.addPost.interval);
        }
        
        $("#input-amount").focus();
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
        
        $("#wizard-next").focus();
    };
    
    function formatDate(date) {
        var monthNames = [ "januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december" ];
        
        var formatted = date.getDate() + ". " + monthNames[date.getMonth()] + " " + date.getFullYear();
        return formatted;
    }
})();