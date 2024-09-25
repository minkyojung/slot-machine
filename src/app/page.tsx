"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from 'next/image'
import confetti from 'canvas-confetti'
import { ConfettiButton } from "@/components/magicui/confetti"

const allSymbols = [
  { id: "symbol", image: "/images/symbol.png" },
  { id: "macbook", image: "/images/macbook.png" },
  { id: "makers-club", image: "/images/makers-club.png" },
  { id: "ccb", image: "/images/ccb1.png" }
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
  const [visibleSymbols, setVisibleSymbols] = useState<Combination>([allSymbols[0], allSymbols[0], allSymbols[0]])
  const [probabilities] = useState(initialProbabilities)
  const [hasSpun, setHasSpun] = useState(false)  // 새로운 상태 변수
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const audioRef1 = useRef<HTMLAudioElement | null>(null)
  const audioRef2 = useRef<HTMLAudioElement | null>(null)
  const confettiButtonRef = useRef<HTMLButtonElement>(null)

  const handleAudioEnd = () => {
    // 오디오가 끝났을 때 수행할 동작을 여기에 작성하세요
  };

  useEffect(() => {
    audioRef1.current = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OK%20LETS%20GO-yzWb791Xi2QzL5X5di4x6ZUu87aLuT.mp3")
    audioRef2.current = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Slot%20Machine%20Jackpot%20Sound-SU1lpwzdgnOKxcZ0WkTNckb0R4rDYz.mp3")

    if (audioRef1.current) audioRef1.current.volume = 0
    if (audioRef2.current) audioRef2.current.volume = 0.6

    return () => {
      audioRef1.current?.removeEventListener('ended', handleAudioEnd)
      audioRef2.current?.removeEventListener('ended', handleAudioEnd)
      audioRef1.current?.pause()
      audioRef2.current?.pause()
    }
  }, [])

  const playAudio = () => {
    if (isAudioPlaying) {
      audioRef1.current?.pause()
      audioRef2.current?.pause()
    }
    
    if (audioRef1.current && audioRef2.current) {
      audioRef1.current.currentTime = 0
      audioRef2.current.currentTime = 0
      audioRef1.current.play()
      audioRef2.current.play()
      setIsAudioPlaying(true)
    }
  }

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setHasSpun(true)

    playAudio()

    const result = selectResultBasedOnProbability()
    
    const spinTimes = [3000, 4500, 5000]
    spinTimes.forEach((time, index) => {
      spinReel(index, time, result[index])
    })

    // 모든 릴이 멈춘 후 결과 확인
    setTimeout(() => {
      checkWin(result)
      setSpinning(false)
    }, Math.max(...spinTimes) + 100)
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
        }
      }
    }, intervalTime)
  }

  const triggerConfetti = () => {
    const end = Date.now() + 3 * 1000; // 3초 동안 실행
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 20, // 파티클 수 증가
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 20, // 파티클 수 증가
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  }

  const triggerSimpleConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  }

  const checkWin = (result: Combination) => {
    if (!hasSpun) return

    console.log("Final symbols:", result.map(s => s.id).join(','))
    if (result[0].id === result[1].id && result[1].id === result[2].id) {
      console.log("Jackpot! You won!")
      triggerConfetti()
    } else if (
      result[0].id === result[1].id ||
      result[1].id === result[2].id ||
      result[0].id === result[2].id
    ) {
      console.log("Two matching symbols! Small win!")
      triggerSimpleConfetti()
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
      <div className="mb-16">
        <motion.div
          animate={{ rotate: spinning ? 360 : 0 }}
          transition={{ duration: 0.5, repeat: spinning ? Infinity : 0, ease: "linear" }}
        >
          <img
            src="/images/coin.png"
            alt="Aster Slot Coin"
            width={45}
            height={45}
            className="object-contain"
          />
        </motion.div>
      </div>
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
                  unoptimized // 이 속성을 추가합니다.
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
      <div className="hidden">
        <ConfettiButton ref={confettiButtonRef}>Hidden Confetti</ConfettiButton>
      </div>
    </div>
  )
}