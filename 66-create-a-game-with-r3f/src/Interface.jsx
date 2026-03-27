import { useKeyboardControls } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { addEffect } from '@react-three/fiber'
import useGame from './stores/useGame.jsx'

export default function Interface()
{
    const time = useRef()

    const restart = useGame((state) => state.restart)
    const phase = useGame((state) => state.phase)
    const nextLevel = useGame((state) => state.nextLevel)
    const level = useGame((state) => state.level)
    const records = useGame((state) => state.records)

    useEffect(() =>
    {
        const unsubscribeEffect = addEffect(() =>
        {
            const state = useGame.getState()
            let elapsedTime = 0

            if(state.phase === 'playing')
                elapsedTime = Date.now() - state.startTime
            else if(state.phase === 'ended')
                elapsedTime = state.endTime - state.startTime

            elapsedTime /= 1000
            elapsedTime = elapsedTime.toFixed(2)

            if(time.current)
                time.current.textContent = elapsedTime
        })

        return () => { unsubscribeEffect() }
    }, [])

    return <div className="interface">
        
        {/* HUD */}
        <div className="time glass-panel">
            Time: <span ref={ time }>0.00</span>
        </div>
        
        {/* High Scores View */}
        <div className="high-scores glass-panel">
            <div className="high-scores-inner">
                <div className="title">High Scores</div>
            {(!records || Object.keys(records).length === 0) ? (
                <div className="record">No records yet</div>
            ) : (
                Object.entries(records).map(([lvl, best]) => (
                    <div className="record" key={lvl}>Level {lvl}: {best.toFixed(2)}s</div>
                ))
            )}
            </div>
        </div>

        <div className="level glass-panel">
            <div className="level-text">Level: { level }</div>
            {records && records[level] && <div className="best-time">Best: {records[level].toFixed(2)}s</div>}
        </div>

        {/* Global Restart Button */}
        <button className="global-restart-btn" onClick={restart}><span>Restart</span></button>

        {/* Screens */}
        { phase === 'ready' && <div className="start-screen glass-panel">
            <h1>Marble Racer</h1>
            <p>Use WASD or Arrows to move. Space to jump.</p>
            <p>Move to Start</p>
        </div> }

        { phase === 'ended' && <div className="end-screen glass-panel">
            <h1>Level {level} Complete!</h1>
            <button className="next-btn" onClick={ nextLevel }>Next Level</button>
        </div> }

        { phase === 'failed' && <div className="end-screen glass-panel">
            <h1>Game Over</h1>
            <p>You hit an obstacle!</p>
            <button className="next-btn" onClick={ restart }>Restart Level</button>
        </div> }

    </div>
}
