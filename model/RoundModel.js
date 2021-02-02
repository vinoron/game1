import { BaseModel } from 'startupjs/orm'
import uuid from 'uuid'

export default class RoundModel extends BaseModel {
  async createByFirstMove (id, gameId, userId, enemyId, type) {
    const obj = this.scope(`${this.getCollection()}.${id}`)
    await obj.createAsync({
      gameId: gameId,
      createdAt: Date.now(),
      finishedAt: null,
      finished: false,
      players: {
        [userId]: { type },
        [enemyId]: {}
      },
      winner: '',
      comboFor: '',
      comboValue: 0
    })
  }

  async setSecondMove (id, userId, enemyId, type, previousRoundId) {
    const $previousRound = this.scope(`${this.getCollection()}.${previousRoundId}`)
    await this.fetchAsync($previousRound)
    const previousRound = $previousRound.get()
    const $round = this.scope(`${this.getCollection()}.${id}`)
    await this.fetchAsync($round)
    const round = $round.get()
    console.debug('previ round data', previousRound)
    console.debug('round data', round)
    round.players[userId] = { type }
    round.finished = true
    round.finishedAt = Date.now()

    const enemyMove = round.players[enemyId].type
    let winner = ''
    if (type !== enemyMove) {
      switch (type) {
        case 'C':
          winner = enemyId
          break
        case 'V':
          winner = enemyMove === 'I' ? userId : enemyId
          break
        case 'O':
          winner = enemyMove === 'V' ? userId : enemyId
          break
        case 'I':
          winner = enemyMove === 'O' ? userId : enemyId
          break
      }
    }

    const isDraw = winner === ''
    const previousComboFor = previousRound ? previousRound.comboFor : ''
    const previousComboValue = previousRound ? previousRound.comboValue : 0
    const isCombo = previousComboFor === winner

    let winnerScore = 0
    if (winner) {
      if (!previousRound || (previousRound && previousRound.winner !== winner) ) {
        winnerScore = 1
      }
      if (isCombo) {
        winnerScore = previousComboValue
      }
    }
    console.log('winnerScore', winnerScore)
    console.log('isDraw', isDraw)
    console.log('previousComboValue', previousComboValue)

    round.winner = winner
    round.comboFor = isDraw ? previousComboFor : winner

    const userScore = userId === winner ? winnerScore : 0
    const userScoreAll = previousRound ? previousRound.players[userId].scoreAll + userScore : userScore
    round.players[userId].score = userScore
    round.players[userId].scoreAll = userScoreAll

    const enemyScore = enemyId === winner ? winnerScore : 0
    const enemyScoreAll = previousRound ? previousRound.players[enemyId].scoreAll + enemyScore : enemyScore
    round.players[enemyId].score = enemyScore
    round.players[enemyId].scoreAll = enemyScoreAll

    round.comboValue = isDraw ? previousComboValue : (winner === userId ? userScoreAll : enemyScoreAll)

    return $round.setEachAsync('', {
      ...round
    })
  }
}



/*
как юзать одну модель в другой - 
import BaseModel from './BaseModel'

export default class SubmissionModel extends BaseModel {
  reset () {
    this.batch(_ => {
      this.setEach('', {
        ratings: 0,
        wins: 0,
        benchmarkGrades: [],
        ratedUserIds: [],
        step: 1,
        locked: false,
        round: 0,
        loses: 0,
        suggestedGrade: false
      })
    })
  }

  lock (userId) {
    return this.batch(_ => {
      this.setEach('', { locked: true, lockedBy: userId, lockedTs: Date.now() })
    })
  }

  act (field) {
    const { ratings, [field]: f } = this.get()
    return this.setEachAsync('', {
      ratings: (ratings || 0) + 1,
      [field]: (f || 0) + 1
    })
  }

  win () {
    return this.act('wins')
  }

  lose () {
    return this.act('loses')
  }

  async makeReport (cardParams) {
    const model = this
    await this.root.addAsync('reports', {
      id: this.id(),
      createdAt: Date.now(),
      submissionId: this.get('id'),
      ...cardParams
    })
    if (!cardParams.isBenchmark) {
      await this.setAsync('reported', true)
    } else {
      const $assignment = model.scope(`assignments.${cardParams.assignmentId}`)
      await model.fetchAsync($assignment)
      $assignment.set('benchmarkReported', true)
      $assignment.unfetch()
    }
  }
}


//////
const [assignment, $assignment] = useDoc('assignments', assignmentId)
вызов
const cards = await $assignment.getBenchmarkCardsStep2({
  userId: user.id,
  canvasUserId: user.canvas ? user.canvas.id : '__DUMMY__'
})
if (!cards) {
  $nocards.set(true)
  return
}
$cards.set(cards)
$nocards.set(false)

----

const [submissions, $submissions] = useQuery('submissions', { assignmentId })

$assignment.setEach({
        benchmarkVideos: { A: {}, B: {}, C: {}, D: {} },
        algorithm: value
      })

























      import BaseModel from './BaseModel'
import _ from 'lodash'
// import { getConsoleOutput } from '@jest/console'
export const TYPE_IMAGE = 'image'
export const TYPE_VIDEO = 'video'
export const TYPE_TEXT = 'text'

const CHARGE = 256
const GRADES = {
  A: 0.9,
  B: 0.75,
  C: 0.6,
  D: 0.5,
  F: 0
}
const USER_GRADE = 'V'

const BenchmarkGrades = ['A', 'B', 'C']
// const BenchmarkGrades = ['A', 'B', 'C', 'D', 'F']
const BenchmarkGradesRev = _.invert(BenchmarkGrades)

const DEFAULT_ITEMS_COUNT = 0

const getGrade = (value, grades = false) => {
  if (!grades) grades = GRADES
  for (const grade of Object.keys(grades)) {
    if (value > grades[grade] * 1) return grade
  }
  return Object.keys(grades).pop()
}

export default class AssignmentsModel extends BaseModel {
  async generatePool () {
    const { id: assignmentId, algorithm } = this.get()
    if (algorithm === 'benchmark') return
    const rootModel = this.root
    const $submissions = this.query('submissions', { assignmentId })
    await $submissions.fetchAsync()
    const submissions = $submissions.get()
    await $submissions.unfetchAsync()
    const pool = submissions.map(v => ({
      id: this.id(),
      submissionId: v.id,
      assignmentId,
      charge: CHARGE,
      canvasUserId: v.canvasUserId,
      round: 0,
      submissionType: v.submissionType,
      url: v.url,
      body: v.body
    }))
    await Promise.all(pool.map(v => rootModel.addAsync('pendings', v)))
  }

  async lockPending (card, userId) {
    const $card = this.scope(`pendings.${card.id}`)
    await $card.fetchAsync()
    await $card.setEachAsync(null, {
      locked: true,
      lockedAt: Date.now(),
      userId
    })
    $card.unfetch()
  }

  async getBenchmarkCardsStep2 ({
    userId = '__DUMMY__',
    canvasUserId
  }) {
    const { id: assignmentId, benchmarkVideos } = this.get()
    const $submissions = this.query(
      'submissions',
      {
        assignmentId,
        canvasUserId: { $ne: canvasUserId },
        url: { $nin: Object.values(benchmarkVideos).map(v => v.url) },
        reported: { $exists: false },
        $or: [
          { locked: false },
          { locked: true, lockedBy: userId },
          { locked: true, lockedTs: { $lt: Date.now() - 60 * 10 * 1000 } }
        ],
        loses: 0,
        $sort: { round: 1 }
      }
    )
    await $submissions.fetchAsync()
    const submissions = $submissions.get()
    $submissions.unfetch()
    const submissionsByGrade = _.groupBy(submissions, 'suggestedGrade')
    for (const grade of Object.keys(submissionsByGrade)) {
      const subs = submissionsByGrade[grade]
      if (subs.length < 2) {
        continue
      }
      const cards = subs.splice(0, 2) // take 2 first
      await this.lockSubmissions(cards.map(v => v.id), userId)
      return cards
    }
    return false
  }

  async lockSubmissions (ids, userId) {
    if (!ids.length) return
    for (const id of ids) {
      const $submission = this.scope(`submissions.${id}`)
      await $submission.fetchAsync()
      await $submission.lock(userId)
      $submission.unfetch()
    }
    return true
  }

  async getBenchmarkCard ({
    userId = '__DUMMY__',
    canvasUserId,
    ignoreUrls = []
  }) {
    const assignmentId = this.get('id')
    const benchmarkVideos = this.get('benchmarkVideos')
    if (!assignmentId || !benchmarkVideos) {
      return false
    }
    const query = {
      assignmentId,
      canvasUserId: { $ne: canvasUserId },
      url: { $nin: ignoreUrls },
      reported: { $exists: false },
      $and: [
        {
          $or: [
            { step: { $exists: false } },
            { step: 1 }
          ]
        },
        {
          $or: [
            { ratedUserIds: { $exists: false } },
            { ratedUserIds: { $size: 0 } },
            { ratedUserIds: { $ne: userId } }
          ]
        }
      ],
      $limit: 1
    }
    const $submissions = this.query('submissions', query)
    await $submissions.fetchAsync()
    const submissions = $submissions.get()
    return submissions[0]
  }

  async getPair (userId = '__DUMMY__', canvasUserId) {
    const assignmentId = this.get('id')
    if (!assignmentId) {
      return false
    }
    const query = {
      $aggregate: [
        {
          $match: {
            assignmentId,
            canvasUserId: { $ne: canvasUserId },
            $or: [
              { locked: { $exists: false } },
              { locked: false },
              { lockedAt: { $lt: Date.now() - 20 * 60 * 1000 } },
              { userId }
            ]
          }
        },
        {
          $lookup: {
            from: 'submissions',
            localField: 'submissionId',
            foreignField: '_id',
            as: 'submission'
          }
        },
        {
          $unwind: '$submission'
        },
        {
          $match: {
            'submission.reported': { $exists: false }
          }
        }
      ]
    }
    console.log('get pair query', query)
    // get pendings
    const $pool = this.query('pendings', query)
    await $pool.fetchAsync()
    const pool = $pool.getExtra()
    $pool.unfetch()
    const poolByRound = _.groupBy(pool, 'round')
    let rounds = Object.keys(poolByRound)
    for (const round of rounds) {
      if (!poolByRound[round] || !poolByRound[round].length) continue
      if (poolByRound[round].length > 1) {
        const [card1, card2] = poolByRound[round]
        card1.id = card1._id
        card2.id = card2._id
        await this.lockPending(card1, userId)
        await this.lockPending(card2, userId)
        return [card1, card2]
      }
      if (
        poolByRound[round].length === 1 &&
        poolByRound[round + 1] &&
        poolByRound[round + 1].length > 0
      ) {
        const card1 = poolByRound[round].pop()
        const card2 = poolByRound[round + 1].pop()
        card1.id = card1._id
        card2.id = card2._id
        await this.lockPending(card1, userId)
        await this.lockPending(card2, userId)
        return [{ ...card1, round: round + 1 }, card2]
      }
    }
    return false
  }

  async submitBenchmarkStep1 ({
    marks, userId, grade, submissionId
  }) {
    const $submission = this.scope(`submissions.${submissionId}`)
    const opts = {}
    await $submission.fetchAsync()
    let { benchmarkGrades = [], ratedUserIds = [], step = 1 } = $submission.get()
    ratedUserIds.push(userId)
    benchmarkGrades.push(grade)
    if (benchmarkGrades.length === 3 || benchmarkGrades[0] === benchmarkGrades[1]) {
      opts.step = 2
      opts.round = 0
      opts.locked = false
      opts.suggestedGrade = BenchmarkGrades[Math.round(benchmarkGrades.reduce((p, c) => p + BenchmarkGradesRev[c] / 1, 0) / benchmarkGrades.length)]
    }
    $submission.setEach('', {
      benchmarkGrades,
      step,
      ratedUserIds,
      ...opts
    })
    $submission.unfetch()
    await Promise.all(marks.map(mark => this.root.addAsync('marks', { id: this.id(), ...mark })))
  }

  async submitBenchmarkStep2 (userId, {
    win, lose, selectedData, selectIndex
  }) {
    const { id: assignmentId } = this.get()
    const $win = this.scope(`submissions.${win.id}`)
    const $lose = this.scope(`submissions.${lose.id}`)
    await this.root.fetchAsync([$win, $lose])
    const { ratings: ratingsLose } = $lose.get()
    await $lose.setEachAsync('', {
      locked: false,
      lockedBy: undefined,
      loses: 1,
      ratings: ratingsLose + 1,
      title: selectedData[selectIndex].title,
      duration: selectedData[selectIndex].duration
    })
    const { wins, ratings: ratingsWins } = $win.get()
    await $win.setEachAsync('', {
      locked: false,
      lockedBy: undefined,
      wins: wins + 1,
      ratings: ratingsWins + 1,
      title: selectedData[1 - selectIndex].title,
      duration: selectedData[1 - selectIndex].duration
    })
    await this.root.addAsync('marks', {
      id: this.id(),
      win: true,
      submissionId: win.submissionId,
      competitorId: lose.submissionId,
      assignmentId,
      userId,
      played: selectedData[selectIndex].played,
      ts: Date.now(),
      ...win.form
    })
    await this.root.addAsync('marks', {
      id: this.id(),
      win: false,
      submissionId: lose.submissionId,
      competitorId: win.submissionId,
      played: selectedData[1 - selectIndex].played,
      assignmentId,
      userId,
      ts: Date.now()
    })
    this.root.unfetch([$win, $lose])
  }

  async submitPair (userId, { win, lose, selectedData, selectIndex }) {
    const { id: assignmentId } = this.get()
    const $win = this.scope(`pendings.${win.id}`)
    const $lose = this.scope(`pendings.${lose.id}`)
    const $winSubmission = this.scope(`submissions.${win.submissionId}`)
    const $loseSubmission = this.scope(`submissions.${lose.submissionId}`)
    await this.root.fetchAsync([$win, $lose, $winSubmission, $loseSubmission])
    await $winSubmission.setEachAsync('', { title: selectedData[selectIndex].title, duration: selectedData[selectIndex].duration })
    await $loseSubmission.setEachAsync('', { title: selectedData[1 - selectIndex].title, duration: selectedData[1 - selectIndex].duration })
    await $win.setEachAsync('', {
      round: win.round + 1,
      locked: false,
      lockedAt: false,
      userId: false
    })
    await $lose.delAsync()
    await $winSubmission.win()
    await $loseSubmission.lose()
    this.root.unfetch([$win, $lose, $winSubmission, $loseSubmission])
    const benchmarkDtIndex = _.find(Object.keys(selectedData), ind => _.get(selectedData, `[${ind}].isBenchmark`, false))
    await this.root.addAsync('marks', {
      id: this.id(),
      win: true,
      submissionId: win.submissionId,
      competitorId: lose.submissionId,
      assignmentId,
      userId,
      played: selectedData[selectIndex].played,
      playedBenchmark: _.get(selectedData, `[${benchmarkDtIndex}].played`, 0),
      ts: Date.now(),
      ...win.form
    })
    await this.root.addAsync('marks', {
      id: this.id(),
      win: false,
      submissionId: lose.submissionId,
      competitorId: win.submissionId,
      played: selectedData[1 - selectIndex].played,
      playedBenchmark: _.get(selectedData, `[${benchmarkDtIndex}].played`, 0),
      assignmentId,
      userId,
      ts: Date.now()
    })
    await this.recalcGrades(assignmentId)
  }

  async reset () {
    const { id: assignmentId } = this.get()
    const model = this
    //
    await this.removeMany('marks', { assignmentId })
    await this.removeMany('pendings', { assignmentId })
    //
    this.set('benchmarkVideos', { A: {}, B: {}, C: {}, D: {} })
    this.set('active', false)
    const $submissions = this.query('submissions', { assignmentId })
    await $submissions.fetchAsync()
    const submissions = $submissions.get()
    $submissions.unfetch()
    //
    this.batch(async _ => {
      await Promise.all(
        submissions.map(
          async v => {
            const $m = model.scope(`submissions.${v.id}`)
            await $m.fetchAsync()
            await $m.reset()
            $m.unfetch()
          }
        )
      )
    })
  }

  async cleanPool () {
    const { id: assignmentId } = this.get()
    await this.removeMany('pengings', { assignmentId })
  }

  async recalcGrades (assignmentId) {
    if (!assignmentId) {
      assignmentId = this.get('id')
    }
    const $submissions = this.query('submissions', { assignmentId })
    const grades = this.get('grades')
    await $submissions.fetchAsync()
    $submissions.unfetch()
    const submissions = $submissions.get()
    const countedV = Object.values(submissions.map(v => v.wins || 0))
    const min = Math.min(...countedV)
    const max = Math.max(...countedV)
    for (const submission of submissions) {
      const { id: submissionId } = submission
      const value = submission.wins || 0
      const percent = 1 - (max - value) / (max - min)
      this.scope(`submissions.${submissionId}`).set('suggestedGrade', getGrade(percent, grades))
    }
  }

  addMark (mark) {
    const { id: assignmentId } = this.get()
    this.root.add('marks', { ...mark, assignmentId })
    this.updateSubmissionOnAddMark(mark)
  }

  updateSubmissionOnAddMark (mark) {
    const { submissionId, win, grade, userName } = mark
    const submission = this.scope(`submissions.${submissionId}`).get()
    if (win) {
      this.scope(`submissions.${submissionId}`).set('wins', (submission.wins || 0) + 1)
    } else {
      this.scope(`submissions.${submissionId}`).set('loses', (submission.loses || 0) + 1)
    }
    const newBenchmarkGrades = submission.benchmarkGrades || []
    newBenchmarkGrades.push({ userName, grade: (!win ? grade : USER_GRADE) })
    this.scope(`submissions.${submissionId}`).set('benchmarkGrades', newBenchmarkGrades)
  }

  canBeEnabled () {
    const { algorithm, benchmarkVideos = {} } = this.get()
    if (!algorithm || algorithm === 'olympic') return true
    for (let i = 0; i < BenchmarkGrades.length - 1; i++) {
      if (!benchmarkVideos[BenchmarkGrades[i]] || !benchmarkVideos[BenchmarkGrades[i]].url) {
        return false
      }
    }
    return true
  }
}

export { GRADES, DEFAULT_ITEMS_COUNT }


*/