"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from 'next/image'

const allSymbols = [
  { id: "heart", image: "/images/symbol.png" },
  { id: "star", image: "/images/macbook.png" },
  { id: "diamond", image: "/images/makers-club.png" },
  { id: "club", image: "/images/coin.png" },
  { id: "spade", image: "/images/upvote-99.png" }
]

type Combination = [typeof allSymbols[0], typeof allSymbols[0], typeof allSymbols[0]]

// 모든 가능한 조합 생성
const generateAllCombinations = (): Combination[] => {
  const combinations: Combination[] = []
  for (let i = 0; i < allSymbols.length; i++) {
    for (let j = 0; j < allSymbols.length; j++) {
      for (let k = 0; k < allSymbols.length; k++) {
        combinations.push([allSymbols[i], allSymbols[j], allSymbols[k]])
      }
    }
  }
  return combinations
}

const allCombinations = generateAllCombinations()

// 초기 확률 설정 (모든 조합에 대해 동일한 확률)
const initialProbabilities = Object.fromEntries(
  allCombinations.map((combo) => [`${combo[0].id},${combo[1].id},${combo[2].id}`, 1 / allCombinations.length])
)

export default function SlotMachine() {
  const [spinning, setSpinning] = useState(false)
  // const [balance, setBalance] = useState(1000) // balance 변수를 주석 처리합니다
  const [visibleSymbols, setVisibleSymbols] = useState<Combination>([allSymbols[0], allSymbols[0], allSymbols[0]])
  const [probabilities] = useState(initialProbabilities) // setProbabilities를 제거합니다
  const audioRef1 = useRef<HTMLAudioElement | null>(null)
  const audioRef2 = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef1.current = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OK%20LETS%20GO-yzWb791Xi2QzL5X5di4x6ZUu87aLuT.mp3")
    audioRef2.current = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Slot%20Machine%20Jackpot%20Sound-SU1lpwzdgnOKxcZ0WkTNckb0R4rDYz.mp3")

    if (audioRef1.current) audioRef1.current.volume = 0
    if (audioRef2.current) audioRef2.current.volume = 0.5

    return () => {
      if (audioRef1.current) audioRef1.current.pause()
      if (audioRef2.current) audioRef2.current.pause()
    }
  }, [])

  const spin = () => {
    if (spinning) return
    setSpinning(true)

    if (audioRef1.current && audioRef2.current) {
      audioRef1.current.currentTime = 0
      audioRef2.current.currentTime = 0
      audioRef1.current.play()
      audioRef2.current.play()

      setTimeout(() => {
        audioRef1.current?.pause()
        audioRef2.current?.pause()
      }, 6500)
    }

    // 확률에 따라 결과 선택
    const result = selectResultBasedOnProbability()
    
    // 애니메이션을 위한 임시 상태 변경
    const spinTimes = [3000, 4500, 5000]
    spinTimes.forEach((time, index) => {
      spinReel(index, time, result[index])
    })
  }

  const selectResultBasedOnProbability = (): Combination => {
    const random = Math.random()
    let cumulativeProbability = 0
    for (const [key, probability] of Object.entries(probabilities)) {
      cumulativeProbability += probability
      if (random <= cumulativeProbability) {
        const [id1, id2, id3] = key.split(',')
        return [
          allSymbols.find(s => s.id === id1)!,
          allSymbols.find(s => s.id === id2)!,
          allSymbols.find(s => s.id === id3)!
        ]
      }
    }
    return allCombinations[0] // 기본값 (이 줄에 도달할 일은 없어야 함)
  }

  const spinReel = (reelIndex: number, spinTime: number, finalSymbol: typeof allSymbols[0]) => {
    const intervalTime = 100
    const totalChanges = spinTime / intervalTime

    let currentChange = 0
    const changeInterval = setInterval(() => {
      setVisibleSymbols(prev => {
        const newSymbols = [...prev] as Combination
        newSymbols[reelIndex] = allSymbols[Math.floor(Math.random() * allSymbols.length)]
        return newSymbols
      })

      currentChange++
      if (currentChange >= totalChanges) {
        clearInterval(changeInterval)
        setVisibleSymbols(prev => {
          const newSymbols = [...prev] as Combination
          newSymbols[reelIndex] = finalSymbol
          return newSymbols
        })
        if (reelIndex === 2) {
          setSpinning(false)
          checkWin()
        }
      }
    }, intervalTime)
  }

  const checkWin = () => {
    if (visibleSymbols[0].id === visibleSymbols[1].id && visibleSymbols[1].id === visibleSymbols[2].id) {
      // setBalance(balance => balance + 100) // 이 줄을 주석 처리합니다
      console.log("You won!") // 대신 콘솔에 메시지를 출력합니다
    }
  }

  // adjustProbability 함수를 주석 처리합니다
  /*
  const adjustProbability = (combination: Combination, newProbability: number) => {
    const key = combination.map(s => s.id).join(',')
    setProbabilities(prev => ({...prev, [key]: newProbability}))
  }
  */

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000] text-white font-sans">
      <div className="mb-16 text-4xl font-semibold">Aster Slot</div>
      <div className="flex space-x-8 mb-16">
        {visibleSymbols.map((symbol, index) => (
          <div
            key={index}
            className="w-64 h-64 bg-[#191919] rounded-2xl flex items-center justify-center overflow-hidden relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={symbol.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <Image
                  src={symbol.image}
                  alt={symbol.id}
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        ))}
      </div>
      <button
        onClick={spin}
        disabled={spinning}
        className="px-16 py-6 bg-white text-black rounded-full text-4xl font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>
    </div>
  )
}