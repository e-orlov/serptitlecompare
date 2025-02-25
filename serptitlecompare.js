javascript: (function (doc) {
    var changed = 0;

    function checkTitles() {
        console.log('jQuery version ', $.fn.jquery, ' loaded');
        if($('#chtop').length) {
            $('#chtop').remove();
        }
        $('#result-stats').append('<div id="chtop" style="display: inline-block"></div>');
        $('#chtop').append('<div style="display: inline-block; color: red;" id="waitforme">Please wait...</div>');
        var position = 1;
        var items = [];
        var results = $('#rso .kp-blk .g, #rso .g[class="g"], #rso .srg .g').not('.kno-kp .g').find('div:first').find('a:first');
        $('.title-changed, #CountTitlesChanged').remove();
        console.log(results);
        results.each(function () {
            if (!$(this).parents('.related-question-pair').length) {
                var parent = $(this).closest('.tF2Cxc').length > 0 ? $(this).closest('.tF2Cxc') : $(this).closest('li');
                items.push([position, $(this).find('h3').text(), encodeURI($(this).attr('href')), parent]);
                position++;
            }
        });
        const allItems = [];
        var numItems = 1;
        cors_proxies = ['https://api.codetabs.com/v1/proxy?quest=', 'https://jsonp.afeld.me/?url=', 'https://cors.bridged.cc/'];
        items.forEach(item => {
            var useItem = {};
            var use_url = item[2];
            useItem.url = use_url;
            $.ajax({
                url: cors_proxies[Math.floor(Math.random() * cors_proxies.length)] + item[2],
                success: function (data, status, xhr) {
                    title = $(data).filter('title').text().trim();
                    var h1 = $(data).find("h1:first").text().trim();
                    useItem.pageTitle = title;
                    useItem.googleTitle = item[1];
                    useItem.pageH1 = h1;
                    useItem.uses_title = false;
                    useItem.uses_h1 = false;
                    useItem.title_rewritten = false;
                    useItem.title_truncated = false;
                    var html = '<div class="title-changed">';
                    var uses_h1 = false;
                    // Google uses the h1 (only if h1 != actual page title)
                    if (h1 == item[1] && h1 != useItem.pageTitle) {
                        uses_h1 = true;
                    }

                    // Check for truncated title 
                    // We only take the first part before "..." and then remove the "..."
                    // to check whether the actual page title includes the first part of the truncated title used by Google 
                    if(useItem.googleTitle.includes("...")) {
                        var google_title_split = useItem.googleTitle.split("...")[0];
                        var compare_google_title_truncated = google_title_split.replace("...", "");
                        if((useItem.pageTitle.includes(compare_google_title_truncated))) {
                            useItem.title_truncated = true;
                        }
                    }
                    
                    

                    if (title != item[1]) {
                        var display_title_pre = "Title: ";
                        var display_title_color = "#ff6961";
                        if(useItem.title_truncated) {
                            display_title_pre = "Title TRUNCATED: ";
                            display_title_color = "#a6cc1d";
                        }
                        html += '<span style="font-weight: bold;color: #ff6961;">'+ display_title_pre + ' ' + title + '</span>';
                        changed++;
                        useItem.title_rewritten = true;
                    } else {
                        html += '<span style="font-weight: bold;color: darkgreen;">Title: ' + item[1] + '</span>';
                    }
                    html += '<div style="display: block; padding:2px 0; font-weight:bold; color: dodgerblue">';
                    if (h1.length && typeof h1 === "string") {
                        html += 'h1: ' + h1;
                    } else {
                        html += 'No h1 found on page';
                    }

                    html += '</div>';
                    if (uses_h1) {
                        useItem.uses_h1 = true;
                        html += '<div style="display: inline-block; background-color: #ffd811; border: 1px solid rgb(74, 85, 104); color: rgb(74, 85, 104); padding-left: 4px; padding-right: 4px; border-radius: 4px;"><b>Uses H1</b></div>';
                    }
                    html += '</div>';
                    item[3].find('div').first().append(html);
                    allItems.push(useItem);
                },
                error: function (xhr, status, error) {
                    var html = '<div class="title-changed">';
                    html += '<span style="font-weight: bold;color: lightslategray;">Error: Request could not be processed</span>';
                    html += '</div>';
                    item[3].find('div').first().append(html);
                },
                complete: function (xhr, status) {
                    if (numItems == items.length) {
                        petitionCompleted(allItems);
                    } else {
                        numItems++;
                    }
                }
            });
        });
        $(document).on('click', '#downloadJsonData', function () {
            downloadObjectAsJson(allItems, "comparison-" + $("input[name=q]").val());
        })
    }

    function petitionCompleted(allItems) {
        $('#result-stats').append('<span id="CountTitlesChanged"> - ' + changed + ' titles have changed</span>');
        $('#chtop').append('<span id="downloadJsonData" style="cursor:pointer; background-color: #fff; border:1px solid #000; border-radius:3px; padding:2px 5px; margin-left: 10px">Download JSON</span>');
        document.getElementById('waitforme').style.display = "none";
    }

    function downloadObjectAsJson(exportObj, exportName) {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }


    if (typeof jQuery == 'undefined') {
        var script_jQuery = document.createElement('script');
        script_jQuery.src = 'https://code.jquery.com/jquery-latest.min.js';
        script_jQuery.onload = checkTitles;
        doc.body.appendChild(script_jQuery);
    } else {
        checkTitles();
    }
})(document)
