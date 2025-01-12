import { ballByBall } from "../data/match_1.js";

const getScoreBoard = () => {
  return {
    teamName: '',
    totalRuns: 0,
    wickets: 0,
    battersData: {},
    extras: {
      noballs: 0, wides: 0, legbyes: 0, byes: 0
    },
    bowlersData: {}
  };
};

const getBatterDetails = () => {
  return {
    name: '',
    dismissal: '',
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0
  };
};

const getBowlerDetails = () => {
  return {
    name: '',
    overs: 0,
    balls: 0,
    runs: 0,
    wicket: 0
  };
};

const getFilderName = (wicket) => {
  return wicket[0].fielders ? wicket[0].kind[0] + ' ' + wicket[0].fielders[0].name : '';
};

export const getDismissal = (wicket, bowler) => {
  return wicket ? getFilderName(wicket) + ' b ' + bowler : 'not out';
};

export const isItBoundry = (runs, score) => runs.batter === score && !runs.non_boundry;

export const isItValidBall = (extras) => !(extras && (Object.keys(extras).includes('wides') || Object.keys(extras).includes('no balls')));

export const batterStats = function (batsMan, data, wicket, batter, bowler, runs, extras) {
  batsMan.name = batter;
  batsMan.dismissal = getDismissal(wicket, bowler);
  batsMan.runs = batsMan.runs + runs.batter;
  batsMan.balls = isItValidBall(extras) ? batsMan.balls + 1 : batsMan.balls;
  batsMan.fours = isItBoundry(runs, 4) ? batsMan.fours + 1 : batsMan.fours;
  batsMan.sixes = isItBoundry(runs, 6) ? batsMan.sixes + 1 : batsMan.sixes;
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
  return wicket ? data.wickets + 1 : data.wickets;
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

  return bowlerStats(data.bowlersData[bowler], wicket, bowler, runs, extras, data);
};

const updatingScoreBoard = function (data, ballsData) {
  ballsData.forEach(({ batter, bowler, runs, extras, wickets }) => {
    data.totalRuns = data.totalRuns + runs.total;
    data.extras = mergeWith(extras, data.extras, add);
    data.wickets = countWickets(wickets, data);
    data = updatingBatterDetails(wickets, batter, bowler, runs, data, extras);
    data = updatingBowlerDetails(bowler, wickets, runs, extras, data);
  });

  return data;
};

const concatBattersDetails = (battersData) => {
  const batters = [];
  const battersDetails = Object.values(battersData);

  for (let index = 0; index < battersDetails.length; index++) {
    batters.push([[battersDetails[index].name, battersDetails[index].dismissal, battersDetails[index].runs, battersDetails[index].balls, battersDetails[index].fours, battersDetails[index].sixes].join(',')]);
  }

  batters.unshift(['Batter,Dismissal,Runs,Balls,4s,6s']);
  return batters.join('\n');
};

const concatBowlersDetails = (bowlersData) => {
  const bowlers = [];
  const bowlersDetails = Object.values(bowlersData);

  for (let index = 0; index < bowlersDetails.length; index++) {
    bowlers.push([[bowlersDetails[index].name, bowlersDetails[index].overs, bowlersDetails[index].runs, bowlersDetails[index].wicket].join(',')]);
  }

  bowlers.unshift(['Bowler,O,R,W']);
  return bowlers.join('\n');
};

const concatingResults = function (team) {
  const intro = 'Team,Total,Wickets\n' + [team.teamName, team.totalRuns, team.wickets].join(',');
  const batters = concatBattersDetails(team.battersData);
  const bowlers = concatBowlersDetails(team.bowlersData);
  const extras = 'Noballs,Wides,Legbyes,Byes\n' + [team.extras.noballs, team.extras.wides, team.extras.legbyes, team.extras.byes].join(',');

  return [intro, batters, extras, bowlers].join('\n---\n');
};

const getResult = (scorecard, ballsData) => {
  updatingScoreBoard(scorecard, ballsData);
  return concatingResults(scorecard);
};

export const generateScoreCard = ballByBall => {
  const ballsData = ballByBall.innings.map(({ overs }) => overs.flatMap(({ deliveries }) => deliveries));
  const teamNames = ballByBall.innings.map(({ team }) => team);

  const scorecard1 = getScoreBoard();
  scorecard1.teamName = teamNames[0];

  const scorecard2 = getScoreBoard();
  scorecard2.teamName = teamNames[1];

  return [getResult(scorecard1, ballsData[0]), getResult(scorecard2, ballsData[1])].join('\n---\n');

};

console.log(generateScoreCard(ballByBall));