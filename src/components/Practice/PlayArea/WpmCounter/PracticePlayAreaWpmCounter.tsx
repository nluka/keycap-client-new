import React, { useEffect, useRef, useState } from 'react';
import { CHARS_PER_WORD } from '../../../../core/constants';
import calcNetWPM from '../../../../core/calcNetWPM';
import countCorrectRoundTextChars from '../../../../core/countCorrectRoundTextChars';
import { useAppSelector } from '../../../../redux/hooks';
import store from '../../../../redux/store';
import { PracticeStatus } from '../../../../redux/types';
import minutesElapsed from '../../../../utility/functions/minutesElapsed';
import './PracticePlayAreaWpmCounter.css';

const UPDATE_INTERVAL_MS = 250;

/**
 * Summary:
 * - Starts off hidden
 * - Hidden during round countdown
 * - Refreshes periodically while round is running
 * - If round is completed, refreshes one last time and displays final WPM
 * - If round is aborted, gets hidden
 */
export default function PracticePlayAreaWpmCounter() {
  const [wpm, setWpm] = useState<number | null>(null);
  const roundStatus = useAppSelector(
    (state) => state.practice.playArea.roundStatus,
  );
  const interval = useRef<NodeJS.Timeout | null>(null);
  const roundResult = store.getState().practice.roundResult;

  useEffect(() => {
    if (roundStatus === PracticeStatus.running) {
      setWpm(0);
      interval.current = setInterval(update, UPDATE_INTERVAL_MS);
      return;
    }

    clearInterval(interval.current as NodeJS.Timeout);
    setWpm(roundResult?.netWordsPerMinute || null);
  }, [roundStatus]);

  // Cleanup
  useEffect(() => () => clearTimeout(interval.current as NodeJS.Timeout), []);

  function update() {
    const { roundStartTime: startTime, roundText: text } =
      store.getState().practice.playArea;

    if (startTime === null) {
      setWpm(null);
      return;
    }

    if (text === null) {
      throw new TypeError('text === null');
    }

    setWpm(
      calcNetWPM(
        countCorrectRoundTextChars(text.words),
        CHARS_PER_WORD,
        minutesElapsed(startTime, Date.now()),
      ),
    );
  }

  function getTitle() {
    if (roundStatus === PracticeStatus.running) {
      return 'Net words per minute';
    }
    if (roundResult !== null) {
      return `Net words per minute: ${roundResult.netWordsPerMinute.toFixed(
        1,
      )}`;
    }
    return undefined;
  }

  return (
    <div
      id="practiceWpmCounter"
      className="text-high d-flex align-items-center gap-1 px-2 py-1 rounded"
      title={getTitle()}
      data-active={
        roundStatus === PracticeStatus.running || roundResult !== null
      }
    >
      <span className="value">{wpm === null ? '-' : wpm.toFixed(0)}</span>
      <span className="unit">WPM</span>
    </div>
  );
}
