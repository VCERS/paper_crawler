//
//  schema-gen.js
//  Don Fick, 23 July 2024
//
//  Appends schema.org metadata as a javascript object on News and Blog pages
//

// Convenience method for displaying the date in friendly international format
Date.prototype.toShortFormat = function() {

    const monthNames = ["Jan", "Feb", "Mar", "Apr",
                        "May", "Jun", "Jul", "Aug",
                        "Sep", "Oct", "Nov", "Dec"];
    const day = this.getDate();
    const monthIndex = this.getMonth();
    const monthName = monthNames[monthIndex];
    const year = this.getFullYear();
    return `${day} ${monthName} ${year}`;
}

// Function to dynamically load a script
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}

// Function to convert datetime to ISO 8601 format
function convertToISO8601(dateString, timeString, timezone) {
    // Combine date and time strings
    var dateTimeString = `${dateString} ${timeString}`;
    // Parse the datetime string with the given timezone
    if (typeof moment !== 'undefined' && moment.tz) {
        var momentObj = moment.tz(dateTimeString, 'YYYY-MM-DD h:mm A', timezone);
        return momentObj.isValid() ? momentObj.toISOString() : null;
    } else {
        console.error('Moment.js or moment-timezone failed to load.');
        return null;
    }
    return momentObj.toISOString();
}

function convertToIsoTime(dateString, timeString, timezone) {
    // // Example usage
    // const dateString = '22 Jul 2024';
    // const timeString = '4:20 PM';
    // const timezone = 'America/New_York'; // Eastern Time
    const isoDateTime = convertToISO8601(dateString, timeString, timezone);
    return isoDateTime;
}

function schemaArticle(articleType) {
    var jsonldScript = document.createElement('script');
    jsonldScript.setAttribute('type', 'application/ld+json');

    var authorArray = [];
    if (AAASdataLayer.page.pageInfo.author) {
      var authors = AAASdataLayer.page.pageInfo.author.split("|");
      for (let i = 0; i < authors.length; i++) {
        if (articleType == 'NewsArticle') {
          let url="https://www.science.org/content/author/"+authors[i].toLowerCase().replaceAll(/[\.]/gi,"").replaceAll(" ","-");
          authorArray.push({"@type": "Person", "name": authors[i], "url": url});
        } else if (articleType == 'Article' || articleType == "BlogPosting") {
          authorArray.push({"@type": "Person", "name": authors[i] });
        }
      }
    }
    
    var ogimage = '';
    if (document.querySelector('meta[property="twitter:image"]')) {
      ogimage = document.querySelector('meta[property="twitter:image"]').content;
    } else if (document.querySelector('meta[property="og:image"]')) {
      ogimage = document.querySelector('meta[property="og:image"]').content;
    }
    var image = [ogimage];

    var structuredData = {
//           "about":"Testing comment to be deleted in production",
      "@context": "https://schema.org",
      "@type": articleType,
//           "headline": AAASdataLayer.page.pageInfo.pageTitle,
//           "datePublished": AAASdataLayer.page.pageInfo.pubDate,
      "mainEntityOfPage": AAASdataLayer.page.pageInfo.pageURL,
      "image": image,
      "author": authorArray,
      "publisher": {
        "@type": "Organization",
        "name": "American Association for the Advancement of Science",
        "url": "https://www.aaas.org/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://feeds.science.org/images/AAAS-and-Science-color.webp"
        }
      }
    }
    if (AAASdataLayer.page.pageInfo.pageTitle) {
        let headline = AAASdataLayer.page.pageInfo.pageTitle;
        headline = headline.substring(0, headline.indexOf(" |"));
        structuredData["headline"] = headline;
    }
    
    var pubTime = "12:00 PM";
    if (articleType == 'NewsArticle') {
        // Select the parent div with the class news-article__hero__info
        const heroInfoDiv = document.querySelector('div.news-article__hero__info');
        if (heroInfoDiv) {
            // Select the time element within the parent div
            timeElement = heroInfoDiv.querySelector('.news-article__hero__bottom-meta li:nth-child(2)');
            if (timeElement) {
                var timeText = timeElement.textContent;
                if ( timeText && timeText.indexOf(" ET") > -1 ) {
                    pubTime = timeText.substring(0, timeText.indexOf(" ET"));
                }
            }
        }
    }
    if (AAASdataLayer.page.pageInfo.pubDate) {
        pubDate = AAASdataLayer.page.pageInfo.pubDate;
    } else if (AAASdataLayer.page.pageInfo.issueDate) {
        pubDate = AAASdataLayer.page.pageInfo.issueDate;
    }
    
    var timezone = 'America/New_York';
    console.log(pubDate, pubTime, timezone);
    var pubDateTime = convertToIsoTime(pubDate, pubTime, timezone);
    console.log("Final: ", pubDate, pubTime, timezone, pubDateTime);
    if (pubDateTime) {
        structuredData["datePublished"] = pubDateTime;
    }
    jsonldScript.textContent = JSON.stringify(structuredData, null, 2);
    document.body.appendChild(jsonldScript);
    return;
}

function schemaJournalBreadcrumbs() {
    var jsonldScript = document.createElement('script');
    jsonldScript.setAttribute('type', 'application/ld+json');
    if (AAASdataLayer.page.attributes && AAASdataLayer.page.attributes.aaasProgram) {
        //pass
    } else { return; }
    var aaasProgram = AAASdataLayer.page.attributes.aaasProgram;
    switch (aaasProgram) {
        case 'science':
            var name1 = "Science";
            var item1 = "https://www.science.org/journal/science";
        break;
        case 'sciadv':
            var name1 = "Science Advances";
            var item1 = "https://www.science.org/journal/sciadv";
        break;
        case 'sciimmunol':
            var name1 = "Sci. Immunol.";
            var item1 = "https://www.science.org/journal/sciimmunol";
        break;
        case 'scirobotics':
            var name1 = "Science Robotics";
            var item1 = "https://www.science.org/journal/scirobotics";
        break;
        case 'signaling':
            var name1 = "Science Signaling";
            var item1 = "https://www.science.org/journal/signaling";
        break;
        case 'stm':
            var name1 = "Sci. Transl. Med.";
            var item1 = "https://www.science.org/journal/stm";
        break;
        default:
            return;
    }
    if (AAASdataLayer.page.pageInfo.issueDate && AAASdataLayer.page.pageInfo.volume && AAASdataLayer.page.pageInfo.issue) {
        //pass
    } else { return; }
    if (AAASdataLayer.page.pageInfo.articleType) {
        //pass
    } else { return; }
    var issueDate = new Date(Date.parse(AAASdataLayer.page.pageInfo.issueDate+"T12:00:00"));
    var volume = AAASdataLayer.page.pageInfo.volume;
    var issue = AAASdataLayer.page.pageInfo.issue;
    var displayDate = issueDate.toShortFormat();
    var articleType = AAASdataLayer.page.pageInfo.articleType;
    var display_articleType = articleType;
    if (articleType.length > 8) {
        display_articleType = "Article"
    }
    switch (articleType) {
        case 'Research Article':
            display_articleType = "Research";
        break;
        case 'Perspective':
            display_articleType = "Analysis";
        break;
        case 'Research Highlights':
            display_articleType = "Highlight";
        break;
    }

    var structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "name": "Breadcrumbs",
      "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": name1,
            "item": item1
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": display_articleType,
            "item": "https://www.science.org/toc/"+aaasProgram+"/"+volume+"/"+issue
          }
//           {
//             "@type": "ListItem",
//             "position": 2,
//             "name": displayDate,
//             "item": "https://www.science.org/toc/"+aaasProgram+"/"+volume+"/"+issue
//           }
      ]
    }
    jsonldScript.textContent = JSON.stringify(structuredData, null, 2);
    document.body.appendChild(jsonldScript);
    return;
}



function schemaNewsBreadcrumbs() {
    var jsonldScript = document.createElement('script');
    jsonldScript.setAttribute('type', 'application/ld+json');
    if (AAASdataLayer.page.attributes && AAASdataLayer.page.attributes.aaasProgram) {
      var aaasProgram = AAASdataLayer.page.attributes.aaasProgram;
    } else { return; }
    switch (aaasProgram) {
      case 'scienceshots':
          var name3 = "ScienceShots";
          var item3 = "https://www.science.org/news/scienceshots";
      break;
      case 'sifter':
          var name3 = "Sifter";
          var item3 = "https://www.science.org/news/sifter";
      break;
      case 'scienceinsider':
          var name3 = "ScienceInsider";
          var item3 = "https://www.science.org/news/scienceinsider";
      break;
      case 'feature-article':
          var name3 = "News Features";
          var item3 = "https://www.science.org/news/features";
      break;
      case 'latest-news':
          var name3 = "Latest News";
          var item3 = "https://www.science.org/news/all-news";
      break;
      default:
          return;
    }
    var structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "name": "Breadcrumbs",
      "itemListElement": [{
//         "@type": "ListItem",
//         "position": 1,
//         "name": "Science",
//         "item": "https://www.science.org/"
//       },{
        "@type": "ListItem",
        "position": 1,
        "name": "News",
        "item": "https://www.science.org/news"
      },{
        "@type": "ListItem",
        "position": 2,
        "name": name3,
        "item": item3
      }]
    }
    jsonldScript.textContent = JSON.stringify(structuredData, null, 2);
    document.body.appendChild(jsonldScript);
    return;
}

function buildSchemas() {
    var pageURL = AAASdataLayer.page.pageInfo.pageURL;
    if ( pageURL.includes("/content/article") ) {
        schemaArticle('NewsArticle');
        schemaNewsBreadcrumbs();
    }
    if ( pageURL.includes("/content/blog-post") ) {
        schemaArticle('BlogPosting');
    }
    if ( pageURL.includes("/doi/") ) {
        schemaArticle('Article');
        schemaJournalBreadcrumbs();
    }


}

document.addEventListener("DOMContentLoaded", (event) => {
    // if we have a data layer on the page
    if (AAASdataLayer && AAASdataLayer.page && AAASdataLayer.page.pageInfo && AAASdataLayer.page.pageInfo.pageURL) {
        // Load moment.js first
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js', () => {
            // Load moment-timezone after moment.js is loaded
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.34/moment-timezone-with-data.min.js', () => {
                buildSchemas();
            });
        });
    }
});