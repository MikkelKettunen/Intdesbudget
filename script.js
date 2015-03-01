(function () {
    "use strict";
    var wizardPage;

    function updateWizardPage() {
        var templ = $("#add-wizard-page" + wizardPage);
        $("#wizard-modal .modal-body").html(templ.html());
        $("#wizard-modal .modal-title").html(templ.attr("data-title"));
    }
    
    $("#wizard-modal").on("show.bs.modal", function(e) {
        wizardPage = 1;
        updateWizardPage();
    });
    
    $("#wizard-next").click(function() {
        wizardPage++;
        updateWizardPage();
    });
})();