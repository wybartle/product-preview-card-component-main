import Parser from 'rss-parser';
import { useEffect } from 'react';
import { Subject } from 'rxjs';

const parser = new Parser({
});

const kolamu = {
  url: 'https://keaolama.org/feed/',
}

let feedSubject:Subject<any> = new Subject<any>();

// Note: some RSS feeds can't be loaded in the browser due to CORS security.
// To get around this, you can use a proxy.
const CORS_PROXY = "https://localhost:3001/"


function fetchFeed() {

  parser.parseURL(CORS_PROXY+kolamu.url, function(err, feed) {
    if (err) throw err;
    console.log(feed.title);
    feedSubject.next(feed);
  })

  return feedSubject;
}

fetchFeed();


const RSSFeedService = {
  getFeed: function() {
    return feedSubject;
  },
  getLatestArticle: function() {
    let latestArticleSubject = new Subject<any>();
    feedSubject.subscribe((feed) => {
      if (!!feed) {
        latestArticleSubject.next(feed.items[0]);
      }
    });
    return latestArticleSubject;
  }
};

export default RSSFeedService;