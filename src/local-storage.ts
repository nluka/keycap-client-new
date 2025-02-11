import {
  DEFAULT_PRACTICE_SETTINGS,
  DEFAULT_PRACTICE_STATS,
} from './utility/constants';
import parseBool from './utility/functions/parseBool';
import type IStats from './utility/types/practice';
import type {
  IPracticeRoundResult,
  IPracticeSettings,
} from './utility/types/practice';

const items = {
  isPanelCollapsedPracticeSettingsProfiles:
    'isPanelCollapsedPracticeSettingsProfiles',
  isPanelCollapsedPracticeSettingsBasic:
    'isPanelCollapsedPracticeSettingsBasic',
  isPanelCollapsedPracticeSettingsAdvanced:
    'isPanelCollapsedPracticeSettingsAdvanced',
  isPanelCollapsedPracticeSettingsDangerZone:
    'isPanelCollapsedPracticeSettingsDangerZone',
  practiceSettings: 'practiceSettings',
  stats: 'stats',
  onlyShowPinnedPracticeSettingsBasic: 'onlyShowPinnedPracticeSettingsBasic',
  onlyShowPinnedPracticeSettingsAdvanced:
    'onlyShowPinnedPracticeSettingsAdvanced',
  isPanelCollapsedProfileDangerZone: 'isPanelCollapsedProfileDangerZone',
  isPanelCollapsedProfilePracticeResults:
    'isPanelCollapsedProfilePracticeResults',
  russianBibleSentences: 'russianBibleSentences',
};
Object.freeze(items);

function getPracticeSettings() {
  const settings = localStorage.getItem(items.practiceSettings);
  if (settings === null) {
    return DEFAULT_PRACTICE_SETTINGS;
  } else {
    return JSON.parse(settings) as IPracticeSettings;
  }
}

function setPracticeSettings(settings: IPracticeSettings) {
  localStorage.setItem(items.practiceSettings, JSON.stringify(settings));
}

function getStats() {
  const stats = localStorage.getItem(items.stats);
  if (stats === null) {
    return DEFAULT_PRACTICE_STATS;
  } else {
    return JSON.parse(stats) as IStats;
  }
}

function setStats(stats: IStats) {
  localStorage.setItem(items.stats, JSON.stringify(stats));
}

function resetStats() {
  setStats(DEFAULT_PRACTICE_STATS);
}

function addCompletedRound(result: IPracticeRoundResult) {
  const stats = getStats();

  if (stats.lastTenRoundResults.length >= 10) {
    stats.lastTenRoundResults = stats.lastTenRoundResults.slice(1, 10);
  }
  stats.lastTenRoundResults.push(result);

  stats.averageRoundResult.accuracyPercentage =
    (stats.averageRoundResult.accuracyPercentage * stats.roundsCompletedCount +
      result.accuracyPercentage) /
    (stats.roundsCompletedCount + 1);

  stats.averageRoundResult.netWordsPerMinute =
    (stats.averageRoundResult.netWordsPerMinute * stats.roundsCompletedCount +
      result.netWordsPerMinute) /
    (stats.roundsCompletedCount + 1);

  stats.averageRoundResult.timeElapsed =
    (stats.averageRoundResult.timeElapsed * stats.roundsCompletedCount +
      result.timeElapsed) /
    (stats.roundsCompletedCount + 1);

  ++stats.roundsCompletedCount;

  setStats(stats);
}

function addAbortedRound() {
  const stats = getStats();
  ++stats.roundsAbortedCount;
  setStats(stats);
}

function getBool(key: string) {
  const stored = localStorage.getItem(key);
  return stored !== null ? parseBool(stored) : false;
}

function setBool(key: string, value: boolean) {
  localStorage.setItem(key, JSON.stringify(value));
}

function hasRussianBibleSentenceData() {
  return localStorage.getItem(items.russianBibleSentences) !== null;
}

async function downloadRussianBibleSentenceData() {
  const fileName = 'russian-bible-sentences.txt';
  try {
    const res = await fetch(`/${fileName}`);
    const text = await res.text();
    localStorage.setItem(items.russianBibleSentences, text);
    return text;
  } catch (err: any) {
    console.error(`Failed to fetch file "${fileName}":`, err);
    throw new Error(`Failed to fetch file "${fileName}"`);
  }
}

function getRussianBibleSentenceData() {
  return localStorage.getItem(items.russianBibleSentences);
}

const exports = {
  items,
  getPracticeSettings,
  setPracticeSettings,
  getStats,
  setStats,
  resetStats,
  addCompletedRound,
  addAbortedRound,
  getBool,
  setBool,
  hasRussianBibleSentenceData,
  downloadRussianBibleSentenceData,
  getRussianBibleSentenceData,
};

export default exports;
