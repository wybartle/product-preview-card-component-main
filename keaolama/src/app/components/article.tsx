'use client'

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
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
  shave('.article__lead', maxHeight, {classname: 'line-clamp'});
}

function findBestTextMatchIndex(anchorText:string, comparisonTexts:string[]) {
  if (comparisonTexts.length === 0) {
    return -1;
  }

  const comparisonTextsWords:Array<string[]> = comparisonTexts.map((comparisonText) => {
    return comparisonText.split(" ");
  });

  const anchorTextWords = anchorText.split(" ");
  let bestMatchIndex:number = 0;
  let bestMatchScore:number = -1;
  for (let i = 0; i < comparisonTextsWords.length; i++) {
    const textMatchScore = intersection(anchorTextWords, comparisonTextsWords[i]).length;
    if (textMatchScore > bestMatchScore) {
      bestMatchScore = textMatchScore;
      bestMatchIndex = i;
    }
  }

  return bestMatchIndex;
}



export default function Article() {

    const [articleDate, setArticleDate] = useState("");
    const [headline, setHeadline] = useState("Lorem Ipsum Dolor sit Amet, Consectetur Adipiscing Elit.");
    const [lead, setLead] = useState("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec lectus maximus mauris dapibus aliquam et ac orci. Sed faucibus egestas iaculis. Donec id dui eu nibh pellentesque aliquet. Ut sagittis, neque id mollis porta, turpis sem dapibus dolor, in feugiat sem turpis nec lectus. Mauris ultricies nunc in arcu rutrum dictum. Aenean et arcu vitae nulla efficitur ullamcorper. Mauris eu lectus erat. Nulla pellentesque augue nulla, at commodo eros viverra in. Duis sagittis viverra leo eu tincidunt.");
    const [articleSet, setArticleSet] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [bodyParagraphs, setBodyParagraphs] = useState<string[]>([]);
    const [leadParagraphIndex, setLeadParagraphIndex] = useState<number | null>(null);

    const getLatestArticle = useCallback(async () => {
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

          const remainingParagraphs:string[] = paragraphs.slice(1);
          setBodyParagraphs(remainingParagraphs);

          const bestLeadParagraphIndex:number = findBestTextMatchIndex(firstParagraph, remainingParagraphs);
          const resolvedLeadParagraphIndex:number = bestLeadParagraphIndex >= 0 ? bestLeadParagraphIndex : 0;
          const leadContent:string = remainingParagraphs[resolvedLeadParagraphIndex] ?? "";
          setLead(leadContent);
          setLeadParagraphIndex(remainingParagraphs.length > 0 ? resolvedLeadParagraphIndex : null);
    
          setArticleSet(true);
        }
    }, [articleSet]);

    const toggleEditMode = useCallback(() => {
      setIsEditMode((previousMode) => !previousMode);
    }, []);

    const resolveLeadParagraphIndex = useCallback((): number | null => {
      if (bodyParagraphs.length === 0) {
        return null;
      }

      if (
        leadParagraphIndex !== null &&
        leadParagraphIndex >= 0 &&
        leadParagraphIndex < bodyParagraphs.length &&
        bodyParagraphs[leadParagraphIndex] === lead
      ) {
        return leadParagraphIndex;
      }

      const exactMatchIndex = bodyParagraphs.indexOf(lead);
      if (exactMatchIndex >= 0) {
        return exactMatchIndex;
      }

      const closestMatchIndex = findBestTextMatchIndex(lead, bodyParagraphs);
      if (closestMatchIndex >= 0) {
        return closestMatchIndex;
      }

      return 0;
    }, [bodyParagraphs, lead, leadParagraphIndex]);

    const swapLeadWithAdjacentParagraph = useCallback((direction:"up" | "down") => {
      const currentIndex = resolveLeadParagraphIndex();
      if (currentIndex === null) {
        return;
      }

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= bodyParagraphs.length) {
        return;
      }

      setLead(bodyParagraphs[targetIndex]);
      setLeadParagraphIndex(targetIndex);
    }, [bodyParagraphs, resolveLeadParagraphIndex]);

    const resolvedLeadParagraphIndex = resolveLeadParagraphIndex();
    const canSwapWithPreviousParagraph = resolvedLeadParagraphIndex !== null && resolvedLeadParagraphIndex > 0;
    const canSwapWithNextParagraph = resolvedLeadParagraphIndex !== null && resolvedLeadParagraphIndex < bodyParagraphs.length - 1;

    useEffect(() => {
      if (!articleSet) {
        getLatestArticle();
      }
    }, [articleSet, getLatestArticle]);

    useEffect(() => {
      if (!articleSet || isEditMode) {
        return;
      }

      const titleNode = document.getElementsByClassName("article__title")[0] as HTMLElement | undefined;
      if (!titleNode) {
        return;
      }

      const titleHeight = titleNode.clientHeight;
      console.log("titleHeight: " + titleHeight + "px");

      clampLines((baseArticleContentHeight - titleHeight - footerHeight - (gapHeight*2) - paddingHeight - 55));
    }, [articleSet, headline, lead, isEditMode]);

    return (
    <>
      <button
        type="button"
        className="article__edit-toggle"
        onClick={toggleEditMode}
        aria-label={isEditMode ? "Confirm card edits" : "Edit card text"}
      >
        <span className="article__edit-icon" aria-hidden="true">
          {isEditMode ? (
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path d="M9.2 16.6 4.8 12.2l1.6-1.6 2.8 2.8 8.4-8.4 1.6 1.6z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path d="m4 17.3 8.9-8.9 2.7 2.7-8.9 8.9H4zm14.7-9.6-1.4 1.4-2.7-2.7L16 5c.4-.4 1-.4 1.4 0l1.3 1.3c.4.4.4 1 0 1.4z" />
            </svg>
          )}
        </span>
        <span>{isEditMode ? "Confirm" : "Edit"}</span>
      </button>

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

        {isEditMode ? (
          <textarea
            className="article__title article__editable-field article__title-editable"
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            aria-label="Edit article title"
            rows={3}
          />
        ) : (
          <h1 className="article__title">
            {headline}
          </h1>
        )}

        {isEditMode ? (
          <textarea
            className="article__lead article__editable-field article__lead-editable"
            value={lead}
            onChange={(event) => {
              setLead(event.target.value);
              setLeadParagraphIndex(null);
            }}
            aria-label="Edit article body"
            rows={10}
          />
        ) : (
          <p className="article__lead line-clamp">
            {lead}
          </p>
        )}

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

    {isEditMode && (
      <div className="article__paragraph-controls" role="group" aria-label="Swap body text with adjacent paragraphs">
        <button
          type="button"
          className="article__paragraph-control-button"
          aria-label="Swap body text with previous paragraph"
          onClick={() => swapLeadWithAdjacentParagraph("up")}
          disabled={!canSwapWithPreviousParagraph}
        >
          <span aria-hidden="true">↑</span>
        </button>
        <button
          type="button"
          className="article__paragraph-control-button"
          aria-label="Swap body text with next paragraph"
          onClick={() => swapLeadWithAdjacentParagraph("down")}
          disabled={!canSwapWithNextParagraph}
        >
          <span aria-hidden="true">↓</span>
        </button>
      </div>
    )}
    </>
    )
}