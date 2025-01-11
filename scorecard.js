import { ballByBall } from "../data/match_1.js";

const getScoreBoard = function () {
  const data = {
    teamName: '',
    totalRuns: 0,
    wickets: 0,
    battersData: {},
    extras: {
      noballs: 0, wides: 0, legbyes: 0, byes: 0
    },
    bowlersData: {}
  };

  return data;
};

const getBatterDetails = function () {
  const details = {
    name: '',
    dismissal: '',
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0
  };

  return details;
};

const getBowlerDetails = function () {
  const details = {
    name: '',
    overs: 0,
    balls: 0,
    runs: 0,
    wicket: 0
  };

  return details;
};

const isFielderThere = (wicket) => {
  return wicket[0].fielders ? 'c ' + wicket[0].fielders[0].name : '';
};

export const getDismissal = (wicket, bowler) => {
  return wicket ? isFielderThere(wicket) + ' b ' + bowler : 'not out';
};

export const isItFour = (runs, batsMan) => runs.batter === 4 && !runs.non_boundry ? batsMan.fours + 1 : batsMan.fours;

export const isItSix = (runs, batsMan) => runs.batter === 6 && !runs.non_boundry ? batsMan.sixes + 1 : batsMan.sixes;

export const isItValidBall = (extras) => !(extras && (Object.keys(extras).includes('wides') || Object.keys(extras).includes('no balls')));

export const batterStats = function (batsMan, data, wicket, batter, bowler, runs, extras) {
  batsMan.name = batter;
  batsMan.dismissal = getDismissal(wicket, bowler);
  batsMan.runs = batsMan.runs + runs.batter;
  batsMan.balls = isItValidBall(extras) ? batsMan.balls + 1 : batsMan.balls;
  batsMan.fours = isItFour(runs, batsMan);
  batsMan.sixes = isItSix(runs, batsMan);
  data.battersData[batter] = batsMan;

  return data;
};

const updatingBatterDetails = function (wicket, batter, bowler, runs, data, extras) {
  if (!(batter in data.battersData)) {
    data.battersData[batter] = getBatterDetails();
  }
  data = batterStats(data.battersData[batter], data, wicket, batter, bowler, runs, extras);
  return data;
};

export const countWickets = function (wicket, data) {
  if (!wicket) {
    return data;
  }

  data.wickets = data.wickets + 1;
  return data;
};

const mergeWith = (o1, o2, f) => {
  const res = { ...o1 };
  for (const [k, v] of Object.entries(o2)) {
    res[k] = res[k] ? f(res[k], v) : v;
  }
  return res;
};

const add = (a, b) => a + b;

const countWicketsTakenByBowler = function (bowlerData, wicket) {
  return wicket ? bowlerData.wicket + 1 : bowlerData.wicket;
};

const bowlerStats = function (bowlerDetail, wicket, bowler, runs, extras, data) {
  bowlerDetail.name = bowler;
  bowlerDetail.balls = isItValidBall(extras) ? bowlerDetail.balls + 1 : bowlerDetail.balls;
  bowlerDetail.overs = Math.floor(bowlerDetail.balls / 6.0) + '.' + bowlerDetail.balls % 6;
  bowlerDetail.runs = bowlerDetail.runs + runs.total;
  bowlerDetail.wicket = countWicketsTakenByBowler(bowlerDetail, wicket);
  data.bowlersData[bowler] = bowlerDetail;

  return data;
};

const updatingBowlerDetails = (bowler, wicket, runs, extras, data) => {
  if (!(bowler in data.bowlersData)) {
    data.bowlersData[bowler] = getBowlerDetails();
  }

  data = bowlerStats(data.bowlersData[bowler], wicket, bowler, runs, extras, data);
  return data;
};

const updatingScoreBoard = function (ballsData, data) {
  ballsData.forEach(({ batter, bowler, runs, extras, wickets }) => {
    data.totalRuns = data.totalRuns + runs.total;
    data.extras = mergeWith(extras, data.extras, add);
    data = countWickets(wickets, data);
    data = updatingBatterDetails(wickets, batter, bowler, runs, data, extras);
    data = updatingBowlerDetails(bowler, wickets, runs, extras, data);
  });

  return data;
};

const concatingResults = function (team) {
  const intro = 'Team,Total,Wickets\n' + team.teamName + team.totalRuns + team.wicket;
  const batters = 

};

export const generateScoreCard = ballByBall => {
  const result = '';
  const ballsData = ballByBall.innings.map(({ overs }) => overs.flatMap(({ deliveries }) => deliveries));
  const teamNames = ballByBall.innings.map(({ team }) => team);
  const scorecard = getScoreBoard();

  updatingScoreBoard(ballsData[0], scorecard);
  scorecard.teamName = teamNames[0];
  result += concatingResults(team1);
  console.log('data', scorecard);
};

generateScoreCard(ballByBall);

