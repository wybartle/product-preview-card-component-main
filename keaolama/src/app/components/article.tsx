'use client'

import Image from 'next/image';
import { useEffect, useState } from 'react';
import shave from 'shave';
import { mahinaMap } from '../utility/dates';
import * as cheerio from 'cheerio';
import { intersection } from 'lodash';
import { getArticleData } from '../services/firebase-client';

const baseArticleContentHeight:number = 600;
const footerHeight:number = 86.5;
const gapHeight:number = 8;
const paddingHeight:number = 10.4;

function clampLines(maxHeight:number) {
  shave('p', maxHeight, {classname: 'line-clamp'});
}

function findBestTextMatch(anchorText:string, comparisonTexts:string[]) {
  const comparisonTextsWords:Array<string[]> = comparisonTexts.map((comparisonText) => {
    return comparisonText.split(" ");
  });
  console.log(comparisonTextsWords);

  const anchorTextWords = anchorText.split(" ");
  let bestMatchIndex:number = 0;
  let bestMatchScore:number = 0;
  for (let i = 0; i < comparisonTextsWords.length; i++) {
    const textMatchScore = intersection(anchorTextWords, comparisonTextsWords[i]).length;
    if (textMatchScore > bestMatchScore) {
      bestMatchScore = textMatchScore;
      bestMatchIndex = i;
    }
  }
  const bestTextMatch:string = comparisonTexts[bestMatchIndex];
  return bestTextMatch
}



export default function Article() {

    let initHasHappened = false;
    const [articleDate, setArticleDate] = useState("");
    const [headline, setHeadline] = useState("Lorem Ipsum Dolor sit Amet, Consectetur Adipiscing Elit.");
    const [lead, setLead] = useState("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec lectus maximus mauris dapibus aliquam et ac orci. Sed faucibus egestas iaculis. Donec id dui eu nibh pellentesque aliquet. Ut sagittis, neque id mollis porta, turpis sem dapibus dolor, in feugiat sem turpis nec lectus. Mauris ultricies nunc in arcu rutrum dictum. Aenean et arcu vitae nulla efficitur ullamcorper. Mauris eu lectus erat. Nulla pellentesque augue nulla, at commodo eros viverra in. Duis sagittis viverra leo eu tincidunt.");
    const [articleSet, setArticleSet] = useState(false);
    let screenshotGenerated:boolean = false;

    async function getLatestArticle() {
      console.log("running getLatestArticle");

      const latestArticle:any = await getArticleData();
        console.log(latestArticle);

        if (latestArticle && !articleSet) {
          
          console.log(latestArticle);
    
          const date:Date = new Date(latestArticle.isoDate);
          const month:number= date.getMonth() + 1;
          let dateString:string = `${mahinaMap[month]} ${date.getDate()}, ${date.getFullYear()}`;
          setArticleDate(dateString);
    
          const $:cheerio.CheerioAPI = cheerio.load(latestArticle["content:encoded"]);
          const $p:cheerio.Cheerio<cheerio.Element> = $("p");
          const paragraphs:string[] = $p.map((i, elem) => {
            return $(elem).text();
          }).get();
          console.log(paragraphs);
         
          const firstParagraph:string = paragraphs[0];
          setHeadline(firstParagraph);
    
          const leadContent:string = findBestTextMatch(firstParagraph, paragraphs.slice(1));
          setLead(leadContent);
    
          setArticleSet(true);
        }
    }

    useEffect(() => {
        console.log("running useEffect");

        if (!initHasHappened && !articleSet) {
          getLatestArticle();
          initHasHappened = true;
        } else {
          const titleNode = document.getElementsByClassName("article__title")[0];
          const titleHeight = titleNode.clientHeight;
          console.log("titleHeight: " + titleHeight + "px");

          clampLines((baseArticleContentHeight - titleHeight - footerHeight - (gapHeight*2) - paddingHeight - 55));
        }

    }, [articleSet, getLatestArticle, clampLines]);

    return (
    <article className="article">

      <div className="flex-group-spaced">

      <p className="article__date label justify-center primary-color-filled">{articleDate}</p>
      
      <Image
        className="top-right-corner-img"
        src="/images/keaolama-kukuna.png"
        alt="kukuna"
        width={80}
        height={50}
        priority
      />
      </div>

      <div className="article__content">

        <h1 className="article__title">
          {headline}
        </h1>

        <p className="line-clamp">
          {lead}
        </p>

        <div className="article__logo-section label stacked">
          <Image
            className="article__bottom-logo"
            src="/images/keaolama-logo.jpg"
            alt="Ke Aolama logo"
            width={100}
            height={50}
            priority
          />
          www.keaolama.org
        </div>
        
      </div>

    </article>
    )
}