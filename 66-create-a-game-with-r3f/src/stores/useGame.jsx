import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export default create(subscribeWithSelector((set, get) =>
{
    let initialRecords = {}
    try {
        const stored = localStorage.getItem('neonRacerRecords')
        if(stored) initialRecords = JSON.parse(stored)
    } catch(err) {}

    return {
        blocksCount: 5,
        blocksSeed: 0,
        level: 1,

        /**
         * Time & Records
         */
        startTime: 0,
        endTime: 0,
        records: initialRecords, 

        /**
         * Phases
         */
        phase: 'ready',

        start: () =>
        {
            set((state) =>
            {
                if(state.phase === 'ready')
                    return { phase: 'playing', startTime: Date.now() }

                return {}
            })
        },

        restart: () =>
        {
            set((state) =>
            {
                if(state.phase === 'playing' || state.phase === 'ended' || state.phase === 'failed')
                    return { phase: 'ready', blocksSeed: Math.random() }

                return {}
            })
        },

        fail: () =>
        {
            set((state) =>
            {
                if(state.phase === 'playing')
                    return { phase: 'failed' }

                return {}
            })
        },

        end: () =>
        {
            set((state) =>
            {
                if(state.phase === 'playing') {
                    const elapsedTime = (Date.now() - state.startTime) / 1000
                    
                    const newRecords = { ...state.records }
                    const currentBest = newRecords[state.level]
                    
                    if (!currentBest || elapsedTime < currentBest) {
                        newRecords[state.level] = elapsedTime
                        localStorage.setItem('neonRacerRecords', JSON.stringify(newRecords))
                    }
                    
                    return { phase: 'ended', endTime: Date.now(), records: newRecords }
                }

                return {}
            })
        },

        nextLevel: () =>
        {
            set((state) =>
            {
                return { 
                    phase: 'ready', 
                    level: state.level + 1, 
                    blocksCount: state.blocksCount + 2, 
                    blocksSeed: Math.random() 
                }
            })
        }
    }
}))
