"use client"

/**
 * Lab 05 — Merkle Trees (พิสูจน์ว่า Order หนึ่งรายการอยู่ในชุดข้อมูลจริง)
 *
 * ไฟล์นี้รวมทุกอย่างจากโปรเจกต์ Next.js/TypeScript เดิม (context, ทุกคอมโพเนนต์,
 * ทุกขั้นของบทเรียน และตรรกะ Merkle tree) ไว้ในไฟล์ React (.jsx) เดียว
 * ทำงานเหมือนต้นฉบับ 100% — สไตล์ทั้งหมดถูกแยกไปไว้ที่ ./lab5.css
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Boxes,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Fingerprint,
  GitBranch,
  GraduationCap,
  HelpCircle,
  Link2,
  PartyPopper,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react"
import "../../css/lab5.css"

/**
 * รวมชื่อคลาสแบบมีเงื่อนไข (เทียบเท่า clsx/cn แบบง่าย)
 *
 * @param {...(string|boolean|null|undefined)} classNames ชื่อคลาสหรือค่าเงื่อนไข
 * @return {string} ชื่อคลาสที่ผ่านเงื่อนไขแล้ว คั่นด้วยช่องว่าง
 * @author StealthTrade Team
 */
function JoinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ")
}

/* ==========================================================================
   lib/merkle — ตรรกะ Merkle tree (SHA-256 จริงผ่าน Web Crypto API)
   ========================================================================== */

export const orders = [
  { id: "A", label: "Order A", value: "BUY 0.2 BTC @ 68,420" },
  { id: "B", label: "Order B", value: "SELL 1.5 ETH @ 3,220" },
  { id: "C", label: "Order C", value: "BUY 500 USDT" },
  { id: "D", label: "Order D", value: "SELL 0.05 BTC @ 69,100" },
]

/**
 * SHA-256 จริงผ่าน Web Crypto API
 *
 * @param {string} message ข้อความที่ต้องการแฮช
 * @return {Promise<string>} ค่า hash เป็น hex ตัวพิมพ์เล็ก
 * @author StealthTrade Team
 */
async function Sha256Hex(message) {
  const data = new TextEncoder().encode(message)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

const midLabels = ["H(A+B)", "H(C+D)"]

/**
 * สร้าง Merkle tree แบบ 4 ใบด้วย SHA-256 จริง
 *
 * @param {string[]} values ข้อมูลของแต่ละใบ (ต้องมี 4 รายการ)
 * @return {Promise<{values: string[], leafHashes: string[], midHashes: string[], root: string, layers: string[][]}>} ต้นไม้ที่สร้างเสร็จแล้ว
 * @author StealthTrade Team
 */
async function BuildMerkleTree(values) {
  const leafHashes = await Promise.all(values.map((value) => Sha256Hex(value)))
  const midHashes = [
    await Sha256Hex(leafHashes[0] + leafHashes[1]),
    await Sha256Hex(leafHashes[2] + leafHashes[3]),
  ]
  const root = await Sha256Hex(midHashes[0] + midHashes[1])
  return {
    values,
    leafHashes,
    midHashes,
    root,
    layers: [leafHashes, midHashes, [root]],
  }
}

/**
 * Hash ของข้าง ๆ ที่ต้องใช้เพื่อเดินจากใบไปหา root
 *
 * @param {Object} tree ต้นไม้ที่ได้จาก BuildMerkleTree
 * @param {number} leafIndex ตำแหน่งของใบที่ต้องการพิสูจน์ (0-3)
 * @return {Array<{nodeId: string, label: string, hash: string, position: string}>} เส้นทางหลักฐานเรียงจากชั้นล่างขึ้นบน
 * @author StealthTrade Team
 */
function GetAuthenticationPath(tree, leafIndex) {
  const leafSiblingIndex = leafIndex ^ 1
  const parentIndex = leafIndex >> 1
  const midSiblingIndex = parentIndex ^ 1
  const leafIds = ["A", "B", "C", "D"]

  return [
    {
      nodeId: `leaf-${leafSiblingIndex}`,
      label: `H(${leafIds[leafSiblingIndex]})`,
      hash: tree.leafHashes[leafSiblingIndex],
      position: leafIndex % 2 === 0 ? "right" : "left",
    },
    {
      nodeId: `mid-${midSiblingIndex}`,
      label: midLabels[midSiblingIndex],
      hash: tree.midHashes[midSiblingIndex],
      position: parentIndex % 2 === 0 ? "right" : "left",
    },
  ]
}

/**
 * รวม hash สองค่าเป็น hash ใหม่ตามตำแหน่งของ sibling
 *
 * @param {string} currentHash hash ที่เราถืออยู่
 * @param {string} siblingHash hash ของ sibling
 * @param {string} position ตำแหน่งของ sibling ("left" หรือ "right")
 * @return {Promise<string>} hash ของค่าที่รวมกันแล้ว
 * @author StealthTrade Team
 */
async function CombineHashes(currentHash, siblingHash, position) {
  // `position` บอกว่า sibling อยู่ฝั่งไหน ค่าที่เราถืออยู่จึงไปอยู่อีกฝั่ง
  return position === "left"
    ? Sha256Hex(siblingHash + currentHash)
    : Sha256Hex(currentHash + siblingHash)
}

/**
 * คำนวณ root ใหม่จาก hash ของใบ + sibling hash ที่เรียงลำดับแล้ว
 *
 * @param {string} leafHash hash ของใบที่ต้องการพิสูจน์
 * @param {Array<{hash: string, position: string}>} siblings sibling hash เรียงจากชั้นล่างขึ้นบน
 * @return {Promise<{steps: string[], root: string}>} hash ของแต่ละชั้น และ root ที่คำนวณได้
 * @author StealthTrade Team
 */
async function ComputeRootFromProof(leafHash, siblings) {
  const steps = []
  let current = leafHash
  for (const sibling of siblings) {
    current = await CombineHashes(current, sibling.hash, sibling.position)
    steps.push(current)
  }
  return { steps, root: current }
}

/**
 * ตรวจว่า root ที่คำนวณได้ตรงกับ root ที่คาดหวังหรือไม่
 *
 * @param {string} computedRoot root ที่คำนวณได้
 * @param {string} expectedRoot root ที่บันทึกไว้
 * @return {boolean} true ถ้าตรงกัน
 * @author StealthTrade Team
 */
function IsInclusionValid(computedRoot, expectedRoot) {
  return computedRoot === expectedRoot
}

/**
 * สลับตัวอักษร hex ตัวแรก เพื่อจำลองว่าข้อมูลถูกปลอมแปลง (แต่ยังเป็น hex ที่ถูกต้อง)
 *
 * @param {string} hash ค่า hash เดิม
 * @return {string} hash ที่ถูกสลับตัวอักษรแรกแล้ว
 * @author StealthTrade Team
 */
function TamperHash(hash) {
  const firstCharacter = hash[0]
  const replacement = firstCharacter === "0" ? "1" : "0"
  return replacement + hash.slice(1)
}

/**
 * ตัด hash ให้สั้นลงเพื่อแสดงผล
 *
 * @param {string} hash ค่า hash เต็ม
 * @param {number} [head=8] จำนวนตัวอักษรที่เก็บไว้ด้านหน้า
 * @return {string} hash ที่ตัดแล้วต่อท้ายด้วย "..." (สตริงว่างถ้าไม่มี hash)
 * @author StealthTrade Team
 */
function TruncateHash(hash, head = 8) {
  if (!hash) return ""
  return `${hash.slice(0, head)}...`
}

/* ==========================================================================
   context — สถานะรวมของบทเรียนทั้งหมด
   ========================================================================== */

export const TOTAL_STEPS = 8

/** ข้อมูลของแต่ละขั้น (จุดสำหรับ progress + ข้อความของผู้สอน) ขั้นที่ 0 คือบทนำ */
export const STEP_META = [
  {
    index: 0,
    topic: "บทนำ",
    mentor:
      "สวัสดีครับ! วันนี้เราจะพิสูจน์ว่า Order หนึ่งรายการอยู่ในชุดข้อมูล โดยไม่ต้องเปิดเผยข้อมูลทั้งหมด",
  },
  {
    index: 1,
    topic: "ปัญหาที่เราจะแก้",
    mentor:
      "ก่อนสร้างต้นไม้ เรามาดูปัญหากันก่อนครับ เราจะพิสูจน์ได้ยังไงว่า Order อยู่ในข้อมูลจริง โดยไม่ต้องเปิดเผยทุก Order?",
  },
  {
    index: 2,
    topic: "สร้างรอยประทับ",
    mentor: "ก่อนเอาข้อมูลมาจับคู่กัน เราทำให้แต่ละ Order กลายเป็นรอยประทับดิจิทัลก่อนครับ",
  },
  {
    index: 3,
    topic: "ประกอบต้นไม้",
    mentor: "ลองจับ Hash สองตัวมารวมกันครับ เราจะได้รอยประทับของ “คู่นี้”",
  },
  {
    index: 4,
    topic: "เลือกสิ่งที่จะพิสูจน์",
    mentor: "ตอนนี้เลือก Order ที่คุณอยากพิสูจน์ได้เลยครับ",
  },
  {
    index: 5,
    topic: "หา Hash ข้าง ๆ",
    mentor: "เราไม่จำเป็นต้องรู้ทุกข้อมูลแล้วครับ ลองมองหา Hash ของข้อมูลที่อยู่ข้าง ๆ Order ที่เราเลือก",
  },
  {
    index: 6,
    topic: "เดินกลับไปหา Root",
    mentor: "ตอนนี้เรามีหลักฐานครบแล้วครับ ลองเดินย้อนกลับจาก Order ไปหา Root ทีละขั้น",
  },
  {
    index: 7,
    topic: "ทดสอบการปลอมแปลง",
    mentor: "ลองเปลี่ยนข้อมูลดูครับ ถ้าข้อมูลเปลี่ยน Hash และ Root จะเปลี่ยนตามไหม?",
  },
  {
    index: 8,
    topic: "สรุปประโยชน์",
    mentor: "เห็นแล้วใช่ไหมครับว่าเราไม่ต้องเปิดเผยทุก Order เราใช้แค่ข้อมูลบนเส้นทางที่จำเป็น",
  },
]

const initialState = {
  currentStep: 0,
  completedSteps: [],
  // step 1
  step1Answer: null,
  isStep1Correct: false,
  // step 2
  hashedLeaves: [false, false, false, false],
  // step 3
  builtPairs: [false, false],
  isRootBuilt: false,
  // step 4
  selectedLeaf: null,
  // step 5
  foundSiblings: [],
  // step 6
  isInterimComputed: false,
  isRootComputed: false,
  // step 7
  isTamperMode: false,
}

const Lab05Context = createContext(null)

/**
 * Provider เก็บสถานะรวมของบทเรียน และสร้าง Merkle tree ตอนเริ่มต้น
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {React.ReactNode} props.children คอมโพเนนต์ลูกที่จะได้ใช้สถานะของบทเรียน
 * @return {JSX.Element} Provider ที่ครอบคอมโพเนนต์ลูก
 * @author StealthTrade Team
 */
export function Lab05Provider({ children }) {
  const [lessonState, setLessonState] = useState(initialState)
  const [tree, setTree] = useState(null)

  useEffect(() => {
    let isActive = true
    BuildMerkleTree(orders.map((order) => order.value)).then((builtTree) => {
      if (isActive) setTree(builtTree)
    })
    return () => {
      isActive = false
    }
  }, [])

  const authPathSteps = useMemo(() => {
    if (!tree || lessonState.selectedLeaf === null) return []
    return GetAuthenticationPath(tree, lessonState.selectedLeaf)
  }, [tree, lessonState.selectedLeaf])

  /**
   * ตรวจว่าขั้นที่ระบุทำเสร็จแล้วหรือยัง
   *
   * @param {number} step หมายเลขขั้น (0-8)
   * @return {boolean} true ถ้าขั้นนั้นทำเสร็จแล้ว
   * @author StealthTrade Team
   */
  const isStepComplete = useCallback(
    (step) => {
      switch (step) {
        case 0:
          return true
        case 1:
          return lessonState.isStep1Correct
        case 2:
          return lessonState.hashedLeaves.every(Boolean)
        case 3:
          return lessonState.builtPairs.every(Boolean) && lessonState.isRootBuilt
        case 4:
          return lessonState.selectedLeaf !== null
        case 5:
          return (
            authPathSteps.length > 0 &&
            authPathSteps.every((pathStep) => lessonState.foundSiblings.includes(pathStep.nodeId))
          )
        case 6:
          return lessonState.isRootComputed
        case 7:
          return lessonState.completedSteps.includes(7) || lessonState.currentStep > 7
        case 8:
          return true
        default:
          return false
      }
    },
    [lessonState, authPathSteps],
  )

  const canProceed = isStepComplete(lessonState.currentStep)

  /**
   * บันทึกว่าขั้นที่ระบุทำเสร็จแล้ว
   *
   * @param {number} step หมายเลขขั้น
   * @return {void}
   * @author StealthTrade Team
   */
  const markComplete = useCallback((step) => {
    setLessonState((previousState) =>
      previousState.completedSteps.includes(step)
        ? previousState
        : { ...previousState, completedSteps: [...previousState.completedSteps, step] },
    )
  }, [])

  /**
   * ไปขั้นถัดไป และบันทึกขั้นปัจจุบันว่าทำเสร็จแล้ว
   *
   * @return {void}
   * @author StealthTrade Team
   */
  const goNext = useCallback(() => {
    setLessonState((previousState) => {
      if (previousState.currentStep >= TOTAL_STEPS) return previousState
      const nextCompletedSteps = previousState.completedSteps.includes(previousState.currentStep)
        ? previousState.completedSteps
        : [...previousState.completedSteps, previousState.currentStep]
      return {
        ...previousState,
        currentStep: previousState.currentStep + 1,
        completedSteps: nextCompletedSteps,
      }
    })
  }, [])

  /**
   * ย้อนกลับไปขั้นก่อนหน้า
   *
   * @return {void}
   * @author StealthTrade Team
   */
  const goPrev = useCallback(() => {
    setLessonState((previousState) =>
      previousState.currentStep <= 0
        ? previousState
        : { ...previousState, currentStep: previousState.currentStep - 1 },
    )
  }, [])

  /**
   * ไปยังขั้นที่ระบุ (ได้เฉพาะบทนำ ขั้นที่ทำเสร็จแล้ว หรือขั้นปัจจุบัน)
   *
   * @param {number} step หมายเลขขั้นปลายทาง
   * @return {void}
   * @author StealthTrade Team
   */
  const goToStep = useCallback((step) => {
    setLessonState((previousState) => {
      // ไปยังบทนำ, ขั้นที่ทำเสร็จแล้ว, หรือขั้นปัจจุบันได้เท่านั้น
      if (step === previousState.currentStep) return previousState
      if (
        step !== 0 &&
        step !== previousState.currentStep &&
        !previousState.completedSteps.includes(step)
      )
        return previousState
      return { ...previousState, currentStep: step }
    })
  }, [])

  /**
   * รีเซ็ตบทเรียนกลับสู่สถานะเริ่มต้น
   *
   * @return {void}
   * @author StealthTrade Team
   */
  const reset = useCallback(() => setLessonState(initialState), [])

  /**
   * บันทึกคำตอบของขั้นที่ 1 (ตัวเลือกที่ 1 คือคำตอบที่ถูก)
   *
   * @param {number} choice ลำดับตัวเลือกที่ผู้เรียนเลือก
   * @return {void}
   * @author StealthTrade Team
   */
  const answerStep1 = useCallback(
    (choice) => {
      const isCorrect = choice === 1
      setLessonState((previousState) => ({
        ...previousState,
        step1Answer: choice,
        isStep1Correct: isCorrect,
      }))
      if (isCorrect) markComplete(1)
    },
    [markComplete],
  )

  /**
   * เปิดเผย hash ของใบที่ระบุ
   *
   * @param {number} index ตำแหน่งของใบ (0-3)
   * @return {void}
   * @author StealthTrade Team
   */
  const revealHash = useCallback((index) => {
    setLessonState((previousState) => {
      const nextHashedLeaves = [...previousState.hashedLeaves]
      nextHashedLeaves[index] = true
      return { ...previousState, hashedLeaves: nextHashedLeaves }
    })
  }, [])

  /**
   * จับคู่ hash ของคู่ที่ระบุ
   *
   * @param {number} pair ลำดับคู่ (0 = A+B, 1 = C+D)
   * @return {void}
   * @author StealthTrade Team
   */
  const buildPair = useCallback((pair) => {
    setLessonState((previousState) => {
      const nextBuiltPairs = [...previousState.builtPairs]
      nextBuiltPairs[pair] = true
      return { ...previousState, builtPairs: nextBuiltPairs }
    })
  }, [])

  /**
   * รวมสองคู่เป็น root
   *
   * @return {void}
   * @author StealthTrade Team
   */
  const buildRoot = useCallback(
    () => setLessonState((previousState) => ({ ...previousState, isRootBuilt: true })),
    [],
  )

  /**
   * เลือกใบที่ต้องการพิสูจน์ และล้างสถานะของขั้นถัดไปทั้งหมด
   *
   * @param {number} index ตำแหน่งของใบ (0-3)
   * @return {void}
   * @author StealthTrade Team
   */
  const selectLeaf = useCallback((index) => {
    setLessonState((previousState) => {
      // เปลี่ยนเป้าหมายแล้วต้องล้างสถานะขั้นถัดไปทั้งหมด
      if (previousState.selectedLeaf === index) return previousState
      return {
        ...previousState,
        selectedLeaf: index,
        foundSiblings: [],
        isInterimComputed: false,
        isRootComputed: false,
        isTamperMode: false,
      }
    })
  }, [])

  /**
   * ตรวจว่าโหนดที่คลิกเป็น sibling ที่อยู่บนเส้นทางหลักฐานหรือไม่ และบันทึกถ้าใช่
   *
   * @param {string} nodeId รหัสโหนดที่ผู้เรียนคลิก
   * @return {string} "wrong" ถ้าไม่ใช่ sibling บนเส้นทาง, "already" ถ้าเลือกไปแล้ว, "correct" ถ้าถูกต้อง
   * @author StealthTrade Team
   */
  const findSibling = useCallback(
    (nodeId) => {
      const isOnPath = authPathSteps.some((pathStep) => pathStep.nodeId === nodeId)
      if (!isOnPath) return "wrong"
      if (lessonState.foundSiblings.includes(nodeId)) return "already"
      setLessonState((previousState) => ({
        ...previousState,
        foundSiblings: [...previousState.foundSiblings, nodeId],
      }))
      return "correct"
    },
    [authPathSteps, lessonState.foundSiblings],
  )

  /**
   * คำนวณ hash ของคู่ (ขั้นแรกของการเดินกลับไปหา root)
   *
   * @return {void}
   * @author StealthTrade Team
   */
  const computeInterim = useCallback(
    () => setLessonState((previousState) => ({ ...previousState, isInterimComputed: true })),
    [],
  )

  /**
   * คำนวณ root และบันทึกว่าขั้นที่ 6 ทำเสร็จแล้ว
   *
   * @return {void}
   * @author StealthTrade Team
   */
  const computeRootStep = useCallback(() => {
    setLessonState((previousState) => ({ ...previousState, isRootComputed: true }))
    markComplete(6)
  }, [markComplete])

  /**
   * เปิด/ปิดโหมดจำลองการปลอมแปลง และบันทึกว่าขั้นที่ 7 ทำเสร็จแล้ว
   *
   * @return {void}
   * @author StealthTrade Team
   */
  const toggleTamper = useCallback(() => {
    setLessonState((previousState) => ({
      ...previousState,
      isTamperMode: !previousState.isTamperMode,
    }))
    markComplete(7)
  }, [markComplete])

  const contextValue = {
    ...lessonState,
    tree,
    authPathSteps,
    goNext,
    goPrev,
    goToStep,
    reset,
    canProceed,
    isStepComplete,
    answerStep1,
    revealHash,
    buildPair,
    buildRoot,
    selectLeaf,
    findSibling,
    computeInterim,
    computeRootStep,
    toggleTamper,
  }

  return <Lab05Context.Provider value={contextValue}>{children}</Lab05Context.Provider>
}

/**
 * Hook สำหรับอ่านสถานะและการกระทำของบทเรียน (ต้องใช้ภายใน Lab05Provider)
 *
 * @return {Object} สถานะรวมและฟังก์ชันของบทเรียน
 * @author StealthTrade Team
 */
export function useLab05() {
  const context = useContext(Lab05Context)
  if (!context) throw new Error("useLab05 must be used within Lab05Provider")
  return context
}

/* ==========================================================================
   components — ชิ้นส่วน UI ย่อย
   ========================================================================== */

/**
 * การ์ดตัวเลือกคำตอบ
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {boolean} props.isSelected ตัวเลือกนี้ถูกเลือกอยู่หรือไม่
 * @param {string} [props.choiceState="default"] สถานะการตรวจคำตอบ ("default", "correct", "incorrect")
 * @param {boolean} props.isDisabled ปิดการกดปุ่มหรือไม่
 * @param {Function} props.onClick ฟังก์ชันที่เรียกเมื่อกด
 * @param {React.ReactNode} props.children เนื้อหาภายในการ์ด
 * @param {string} props.className ชื่อคลาสเพิ่มเติม
 * @return {JSX.Element} ปุ่มตัวเลือก
 * @author StealthTrade Team
 */
function ChoiceCard({ isSelected, choiceState = "default", isDisabled, onClick, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-pressed={isSelected}
      className={JoinClassNames(
        "lab5-choice",
        isSelected && choiceState === "default" && "lab5-choice--selected",
        choiceState === "correct" && "lab5-choice--correct",
        choiceState === "incorrect" && "lab5-choice--incorrect",
        className,
      )}
    >
      {children}
    </button>
  )
}

const feedbackConfig = {
  correct: { icon: CheckCircle2, tone: "success" },
  success: { icon: CheckCircle2, tone: "success" },
  incorrect: { icon: RotateCcw, tone: "danger" },
  failed: { icon: XCircle, tone: "danger" },
}

/**
 * การ์ดแสดงผลตอบรับหลังผู้เรียนตอบหรือทำขั้นตอนต่าง ๆ
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {string} props.variant ชนิดของผลตอบรับ ("correct", "success", "incorrect", "failed")
 * @param {string} props.title หัวข้อของการ์ด
 * @param {React.ReactNode} props.children คำอธิบายใต้หัวข้อ
 * @param {string} props.className ชื่อคลาสเพิ่มเติม
 * @return {JSX.Element} การ์ดผลตอบรับ
 * @author StealthTrade Team
 */
function FeedbackCard({ variant, title, children, className }) {
  const config = feedbackConfig[variant]
  const Icon = config.icon
  return (
    <div
      role="status"
      className={JoinClassNames(
        "lab5-animate-merge-up lab5-feedback",
        config.tone === "success" ? "lab5-feedback--success" : "lab5-feedback--danger",
        className,
      )}
    >
      <Icon className={JoinClassNames("lab5-feedback-icon", config.tone === "success" ? "lab5-feedback-icon--success" : "lab5-feedback-icon--danger")} />
      <div className="lab5-space-y-1">
        <p className={JoinClassNames("lab5-feedback-title", config.tone === "success" ? "lab5-feedback-title--success" : "lab5-feedback-title--danger")}>
          {title}
        </p>
        {children && <div className="lab5-text-sm lab5-leading-relaxed lab5-text-foreground-80">{children}</div>}
      </div>
    </div>
  )
}

const glossaryEntries = [
  { term: "Hash", def: "รอยประทับดิจิทัลของข้อมูล" },
  { term: "Leaf", def: "ข้อมูลที่อยู่ปลายสุดของต้นไม้ เช่น Order A" },
  { term: "Sibling Hash", def: "Hash ของข้อมูลที่อยู่ข้าง ๆ บนเส้นทางที่เรากำลังพิสูจน์" },
  { term: "Root", def: "Hash เดียวที่สรุปต้นไม้ทั้งหมด" },
  { term: "Authentication Path", def: "ชุดของ Hash ที่เราต้องใช้เพื่อเดินจากข้อมูลที่เลือกกลับไปหา Root" },
  { term: "Inclusion Proof", def: "หลักฐานที่แสดงว่า Order นี้อยู่ในต้นไม้" },
]

/**
 * คำศัพท์แบบยุบไว้ก่อน (ปิดโดยดีฟอลต์) อยู่ในหัว เพื่อไม่ให้ขัดจังหวะการเรียน
 * ผู้เรียนเปิดดูเองเมื่อต้องการเช็คคำศัพท์
 *
 * @return {JSX.Element} ปุ่มเปิด/ปิดพร้อมรายการคำศัพท์
 * @author StealthTrade Team
 */
function Glossary() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lab5-mx-auto lab5-w-full lab5-max-w-3xl">
      <button
        type="button"
        onClick={() => setIsOpen((previousIsOpen) => !previousIsOpen)}
        aria-expanded={isOpen}
        className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-border lab5-border-border lab5-bg-surface-soft lab5-px-3 lab5-py-1.5 lab5-text-xs lab5-font-semibold lab5-text-muted-foreground lab5-transition-colors lab5-hover-surface"
      >
        <BookOpen className="lab5-size-3.5" />
        คำศัพท์ที่เพิ่งเจอ
        <ChevronDown className={JoinClassNames("lab5-size-3.5 lab5-transition-transform", isOpen && "lab5-rotate-180")} />
      </button>

      {isOpen && (
        <div className="lab5-animate-merge-up lab5-mt-2 lab5-grid lab5-gap-2 lab5-rounded-xl lab5-border lab5-border-border lab5-bg-surface lab5-p-3 lab5-sm:grid-cols-2">
          {glossaryEntries.map((entry) => (
            <div key={entry.term} className="lab5-rounded-lg lab5-bg-surface-soft lab5-p-2.5">
              <p className="lab5-text-xs lab5-font-bold lab5-text-primary">{entry.term}</p>
              <p className="lab5-mt-0.5 lab5-text-xs lab5-leading-relaxed lab5-text-muted-foreground">{entry.def}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const hashToneClass = {
  neutral: "lab5-hash-toggle--neutral",
  primary: "lab5-hash-toggle--primary",
  success: "lab5-hash-toggle--success",
  danger: "lab5-hash-toggle--danger",
}

/**
 * แสดงค่า hash แบบย่อ กดเพื่อดูค่าเต็ม และคัดลอกได้
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {string} props.hash ค่า hash เต็ม
 * @param {string} [props.label] ข้อความนำหน้า hash
 * @param {string} [props.tone="neutral"] โทนสี ("neutral", "primary", "success", "danger")
 * @param {string} [props.className] ชื่อคลาสเพิ่มเติม
 * @return {JSX.Element} ปุ่มแสดง hash และกล่องแสดงค่าเต็มเมื่อขยาย
 * @author StealthTrade Team
 */
function HashValue({ hash, label, tone = "neutral", className }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  /**
   * คัดลอกค่า hash เต็มลงคลิปบอร์ด และแสดงสถานะ "คัดลอกแล้ว" ชั่วครู่
   *
   * @return {Promise<void>}
   * @author StealthTrade Team
   */
  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(hash)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className={JoinClassNames("lab5-inline-flex lab5-flex-col lab5-gap-1", className)}>
      <button
        type="button"
        onClick={() => setIsExpanded((previousIsExpanded) => !previousIsExpanded)}
        className={JoinClassNames("lab5-hash-toggle", hashToneClass[tone])}
        aria-expanded={isExpanded}
      >
        {label && <span className="lab5-font-sans lab5-font-semibold lab5-not-italic">{label}</span>}
        <span>{isExpanded ? "ซ่อน" : TruncateHash(hash)}</span>
      </button>

      {isExpanded && (
        <div className="lab5-animate-merge-up lab5-flex lab5-items-start lab5-gap-2 lab5-rounded-lg lab5-border lab5-border-border lab5-bg-surface lab5-p-2">
          <code className="lab5-break-all lab5-font-mono lab5-text-11 lab5-leading-relaxed lab5-text-foreground">{hash}</code>
          <button
            type="button"
            onClick={copyHash}
            className="lab5-shrink-0 lab5-rounded-md lab5-p-1 lab5-text-muted-foreground lab5-transition-colors lab5-hover-surface-soft lab5-hover-text-primary"
            aria-label="คัดลอก hash"
          >
            {isCopied ? <Check className="lab5-size-3.5 lab5-text-success" /> : <Copy className="lab5-size-3.5" />}
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * ปุ่มคำใบ้ กดเพื่อเปิด/ปิดคำอธิบาย
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {string} [props.label="ทำไม?"] ข้อความบนปุ่ม
 * @param {React.ReactNode} props.children เนื้อหาคำใบ้
 * @param {string} [props.className] ชื่อคลาสเพิ่มเติม
 * @return {JSX.Element} ปุ่มและกล่องคำใบ้
 * @author StealthTrade Team
 */
function HintButton({ label = "ทำไม?", children, className }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className={JoinClassNames("lab5-space-y-2", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((previousIsOpen) => !previousIsOpen)}
        aria-expanded={isOpen}
        className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-border lab5-border-primary-30 lab5-bg-primary-soft lab5-px-3 lab5-py-1.5 lab5-text-xs lab5-font-semibold lab5-text-primary lab5-transition-colors lab5-hover-primary-10"
      >
        <HelpCircle className="lab5-size-3.5" />
        {label}
      </button>
      {isOpen && (
        <div className="lab5-animate-merge-up lab5-rounded-xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-3 lab5-text-sm lab5-leading-relaxed lab5-text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * หัวข้อของแต่ละขั้นในบทเรียน
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {string} props.sectionLabel ป้ายชื่อส่วนด้านบนหัวข้อ
 * @param {string} props.title หัวข้อหลัก
 * @param {string} [props.description] คำอธิบายใต้หัวข้อ
 * @return {JSX.Element} ส่วนหัวของบทเรียน
 * @author StealthTrade Team
 */
function LessonHeading({ sectionLabel, title, description }) {
  return (
    <div className="lab5-space-y-2">
      <span className="lab5-inline-block lab5-rounded-full lab5-bg-primary-soft lab5-px-3 lab5-py-1 lab5-text-xs lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-primary">
        {sectionLabel}
      </span>
      <h2 className="lab5-text-balance lab5-text-xl lab5-font-extrabold lab5-leading-tight lab5-text-foreground lab5-sm:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="lab5-text-pretty lab5-text-sm lab5-leading-relaxed lab5-text-muted-foreground lab5-sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}

/**
 * กล่องข้อความของผู้สอน
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {string} props.message ข้อความที่ผู้สอนพูด
 * @return {JSX.Element} กล่องข้อความพร้อมไอคอนผู้สอน
 * @author StealthTrade Team
 */
function MentorMessage({ message }) {
  return (
    <div className="lab5-flex lab5-items-start lab5-gap-3 lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4 lab5-shadow-sm">
      <div className="lab5-flex lab5-size-10 lab5-shrink-0 lab5-items-center lab5-justify-center lab5-rounded-full lab5-bg-primary-soft lab5-text-primary">
        <GraduationCap className="lab5-size-5" />
      </div>
      <div className="lab5-min-w-0">
        <div className="lab5-flex lab5-items-baseline lab5-gap-2">
          <span className="lab5-text-sm lab5-font-bold lab5-text-foreground">อ.มิน</span>
          <span className="lab5-text-xs lab5-text-muted-foreground">ผู้สอน</span>
        </div>
        <p className="lab5-mt-0.5 lab5-text-sm lab5-leading-relaxed lab5-text-foreground-80 lab5-text-pretty">{message}</p>
      </div>
    </div>
  )
}

const nodeLayouts = [
  { id: "root", label: "ROOT", centerX: 50, centerY: 12 },
  { id: "mid-0", label: "H(A+B)", centerX: 26, centerY: 44 },
  { id: "mid-1", label: "H(C+D)", centerX: 74, centerY: 44 },
  { id: "leaf-0", label: "H(A)", centerX: 12, centerY: 80 },
  { id: "leaf-1", label: "H(B)", centerX: 38, centerY: 80 },
  { id: "leaf-2", label: "H(C)", centerX: 62, centerY: 80 },
  { id: "leaf-3", label: "H(D)", centerX: 88, centerY: 80 },
]

const edges = [
  ["root", "mid-0"],
  ["root", "mid-1"],
  ["mid-0", "leaf-0"],
  ["mid-0", "leaf-1"],
  ["mid-1", "leaf-2"],
  ["mid-1", "leaf-3"],
]

const nodeStateClass = {
  neutral: "lab5-node--neutral",
  target: "lab5-node--target",
  path: "lab5-node--path",
  success: "lab5-node--success",
  error: "lab5-node--error",
}

/**
 * แผนภาพ Merkle tree พร้อมสถานะของแต่ละโหนด
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {Object<string, string>} [props.nodeStateMap={}] สถานะของแต่ละโหนด (key คือรหัสโหนด)
 * @param {Object<string, boolean>} [props.visibilityMap] การแสดง/ซ่อนของแต่ละโหนด (ไม่ระบุ = แสดงทั้งหมด)
 * @param {string[]} [props.hashNodeIds=[]] รหัสโหนดที่ต้องแสดงค่า hash
 * @param {string[]} [props.clickableNodeIds=[]] รหัสโหนดที่กดได้
 * @param {Function} [props.onNodeClick] ฟังก์ชันที่เรียกเมื่อกดโหนดที่กดได้
 * @param {string} [props.className] ชื่อคลาสเพิ่มเติม
 * @return {JSX.Element} แผนภาพต้นไม้
 * @author StealthTrade Team
 */
function MerkleTreeDiagram({ nodeStateMap = {}, visibilityMap, hashNodeIds = [], clickableNodeIds = [], onNodeClick, className }) {
  const { tree } = useLab05()

  /**
   * หาค่า hash ของโหนดที่ระบุ (ถ้าโหนดนั้นต้องแสดง hash)
   *
   * @param {string} nodeId รหัสโหนด
   * @return {string|undefined} ค่า hash หรือ undefined ถ้าไม่ต้องแสดง
   * @author StealthTrade Team
   */
  const getHashByNodeId = (nodeId) => {
    if (!tree || !hashNodeIds.includes(nodeId)) return undefined
    if (nodeId === "root") return tree.root
    if (nodeId.startsWith("mid-")) return tree.midHashes[Number(nodeId.slice(4))]
    if (nodeId.startsWith("leaf-")) return tree.leafHashes[Number(nodeId.slice(5))]
    return undefined
  }

  /**
   * ตรวจว่าโหนดที่ระบุต้องแสดงหรือไม่
   *
   * @param {string} nodeId รหัสโหนด
   * @return {boolean} true ถ้าต้องแสดง
   * @author StealthTrade Team
   */
  const isVisible = (nodeId) => (visibilityMap ? visibilityMap[nodeId] !== false : true)

  /**
   * หาสถานะของโหนดที่ระบุ
   *
   * @param {string} nodeId รหัสโหนด
   * @return {string} สถานะของโหนด (ค่าเริ่มต้นคือ "neutral")
   * @author StealthTrade Team
   */
  const getNodeState = (nodeId) => nodeStateMap[nodeId] ?? "neutral"

  /**
   * หาสถานะของเส้นเชื่อมระหว่างสองโหนด
   *
   * @param {string} fromId รหัสโหนดต้นทาง
   * @param {string} toId รหัสโหนดปลายทาง
   * @return {string|boolean} "error", "active" หรือ false ถ้าเส้นไม่ต้องเน้น
   * @author StealthTrade Team
   */
  const getEdgeState = (fromId, toId) => {
    if (!isVisible(fromId) || !isVisible(toId)) return false
    const fromState = getNodeState(fromId)
    const toState = getNodeState(toId)
    const isLit = (nodeStateName) => nodeStateName === "path" || nodeStateName === "target" || nodeStateName === "success"
    const isError = (nodeStateName) => nodeStateName === "error"
    if (isError(fromState) || isError(toState)) return "error"
    return isLit(fromState) && isLit(toState) ? "active" : false
  }

  return (
    <div className={JoinClassNames("lab5-relative lab5-mx-auto lab5-h-64 lab5-w-full lab5-max-w-2xl lab5-sm:h-80", className)}>
      <svg className="lab5-absolute lab5-inset-0 lab5-h-full lab5-w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {edges.map(([fromId, toId]) => {
          const from = nodeLayouts.find((layoutNode) => layoutNode.id === fromId)
          const to = nodeLayouts.find((layoutNode) => layoutNode.id === toId)
          if (!isVisible(fromId) || !isVisible(toId)) return null
          const edgeState = getEdgeState(fromId, toId)
          return (
            <line
              key={`${fromId}-${toId}`}
              x1={from.centerX}
              y1={from.centerY}
              x2={to.centerX}
              y2={to.centerY}
              vectorEffect="non-scaling-stroke"
              className={JoinClassNames(
                "lab5-transition-colors lab5-duration-300",
                edgeState === "active" && "lab5-stroke-primary",
                edgeState === "error" && "lab5-stroke-danger",
                !edgeState && "lab5-stroke-border",
              )}
              strokeWidth={edgeState ? 2 : 1.25}
            />
          )
        })}
      </svg>

      {nodeLayouts.map((node) => {
        if (!isVisible(node.id)) return null
        const currentNodeState = getNodeState(node.id)
        const hash = getHashByNodeId(node.id)
        const isClickable = clickableNodeIds.includes(node.id)
        const NodeElement = isClickable ? "button" : "div"
        return (
          <NodeElement
            key={node.id}
            {...(isClickable ? { type: "button", onClick: () => onNodeClick?.(node.id) } : {})}
            style={{ left: `${node.centerX}%`, top: `${node.centerY}%` }}
            className={JoinClassNames(
              "lab5-node",
              nodeStateClass[currentNodeState],
              isClickable && "lab5-node--clickable",
              (currentNodeState === "path" || currentNodeState === "success" || currentNodeState === "error") && "lab5-animate-merge-up",
            )}
          >
            <span className="lab5-node-label">{node.label}</span>
            {hash && <span className="lab5-node-hash">{TruncateHash(hash, 6)}</span>}
          </NodeElement>
        )
      })}
    </div>
  )
}

/**
 * แถบจุดแสดงความคืบหน้าของขั้นที่ 1-8 (บทนำไม่มีจุด)
 *
 * @return {JSX.Element} แถบความคืบหน้าและชื่อขั้นปัจจุบัน
 * @author StealthTrade Team
 */
function LabProgress() {
  const { currentStep, completedSteps, goToStep } = useLab05()
  // จุด progress แทนขั้นที่ 1..8 (บทนำไม่มีจุด)
  const steps = Array.from({ length: TOTAL_STEPS }, (unusedValue, index) => index + 1)

  return (
    <div className="lab5-flex lab5-flex-col lab5-items-center lab5-gap-2">
      <div className="lab5-flex lab5-items-center lab5-gap-1.5 lab5-overflow-x-auto lab5-py-1">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step)
          const isCurrent = currentStep === step
          const isReachable = isCompleted || isCurrent
          return (
            <div key={step} className="lab5-flex lab5-items-center lab5-gap-1.5">
              <button
                type="button"
                disabled={!isReachable}
                onClick={() => goToStep(step)}
                aria-label={`ขั้นที่ ${step}: ${STEP_META[step].topic}`}
                aria-current={isCurrent ? "step" : undefined}
                className={JoinClassNames(
                  "lab5-dot",
                  isCurrent && "lab5-dot--current lab5-animate-soft-pulse",
                  isCompleted && !isCurrent && "lab5-dot--completed",
                  !isReachable && "lab5-dot--locked",
                  isReachable && !isCurrent && "lab5-dot--reachable",
                )}
              >
                {isCompleted && !isCurrent ? <Check className="lab5-size-3.5" /> : step}
              </button>
              {step < TOTAL_STEPS && (
                <span className={JoinClassNames("lab5-progress-line lab5-sm:w-5", completedSteps.includes(step) && "lab5-progress-line--done")} />
              )}
            </div>
          )
        })}
      </div>
      <p className="lab5-text-center lab5-text-xs lab5-font-medium lab5-text-muted-foreground">
        {currentStep === 0 ? "บทนำ" : `ขั้นที่ ${currentStep} · ${STEP_META[currentStep].topic}`}
      </p>
    </div>
  )
}

/**
 * แถบปุ่มนำทางด้านล่าง (เริ่มใหม่ / ย้อนกลับ / ไปขั้นต่อ) ซ่อนในหน้าบทนำ
 *
 * @return {JSX.Element|null} แถบนำทาง หรือ null เมื่ออยู่หน้าบทนำ
 * @author StealthTrade Team
 */
function LabNavigation() {
  const { currentStep, canProceed, goNext, goPrev, reset } = useLab05()

  if (currentStep === 0) return null

  const isLast = currentStep === TOTAL_STEPS

  return (
    <div className="lab5-sticky lab5-bottom-0 lab5-z-10 lab5-border-t lab5-border-border lab5-bg-surface-85 lab5-backdrop-blur-sm">
      <div className="lab5-mx-auto lab5-flex lab5-max-w-3xl lab5-items-center lab5-justify-between lab5-gap-3 lab5-px-4 lab5-py-3">
        <button type="button" onClick={reset} className="lab5-nav-reset">
          <RotateCcw className="lab5-size-4" />
          <span className="lab5-hidden lab5-sm:inline">เริ่มใหม่</span>
        </button>

        <div className="lab5-flex lab5-items-center lab5-gap-2">
          <button type="button" onClick={goPrev} className="lab5-nav-prev">
            <ArrowLeft className="lab5-size-4" />
            ย้อนกลับ
          </button>
          {!isLast && (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className={JoinClassNames("lab5-nav-next", canProceed ? "lab5-nav-next--enabled" : "lab5-nav-next--disabled")}
            >
              ไปขั้นต่อ
              <ArrowRight className="lab5-size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   steps — เนื้อหาแต่ละขั้นของบทเรียน
   ========================================================================== */

/**
 * หน้าบทนำของบทเรียน (ขั้นที่ 0)
 *
 * @return {JSX.Element} หน้าบทนำพร้อมปุ่มเริ่มเรียน
 * @author StealthTrade Team
 */
function StepIntro() {
  const { goNext } = useLab05()

  return (
    <div className="lab5-space-y-8 lab5-text-center">
      <div className="lab5-space-y-3">
        <span className="lab5-inline-block lab5-rounded-full lab5-bg-primary-soft lab5-px-3 lab5-py-1 lab5-text-xs lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-primary">
          Lab 05
        </span>
        <h1 className="lab5-text-balance lab5-text-3xl lab5-font-extrabold lab5-leading-tight lab5-text-foreground lab5-sm:text-4xl">
          Merkle Trees
        </h1>
        <p className="lab5-mx-auto lab5-max-w-md lab5-text-pretty lab5-text-base lab5-leading-relaxed lab5-text-muted-foreground">
          วันนี้เราจะเรียนรู้ส่วนหนึ่งของระบบที่ใช้พิสูจน์ข้อมูล: เราจะพิสูจน์ว่า Order หนึ่งรายการ
          อยู่ในชุดข้อมูลจริง โดยไม่ต้องเปิดเผย Order อื่นทั้งหมด
        </p>
      </div>

      <div className="lab5-flex lab5-items-center lab5-justify-center lab5-gap-3 lab5-sm:gap-5">
        <IntroPill icon={<Boxes className="lab5-size-5" />} label="Orders" />
        <ArrowRight className="lab5-size-4 lab5-shrink-0 lab5-text-muted-foreground" />
        <IntroPill icon={<Fingerprint className="lab5-size-5" />} label="รอยประทับ" />
        <ArrowRight className="lab5-size-4 lab5-shrink-0 lab5-text-muted-foreground" />
        <IntroPill icon={<GitBranch className="lab5-size-5" />} label="Root" />
      </div>

      <div className="lab5-mx-auto lab5-max-w-md lab5-space-y-2">
        <p className="lab5-text-pretty lab5-text-sm lab5-leading-relaxed lab5-text-foreground-70">
          วันนี้คุณจะลองสร้างต้นไม้เอง แล้วพิสูจน์ Order หนึ่งรายการด้วย hash เพียงบางส่วน
        </p>
        <p className="lab5-text-pretty lab5-text-xs lab5-leading-relaxed lab5-text-muted-foreground">
          หมายเหตุ: นี่ไม่ใช่ ZKP ทั้งระบบ แต่เป็นกลไกพื้นฐานที่ช่วยสร้างหลักฐานการมีอยู่ของข้อมูล
        </p>
      </div>

      <button
        type="button"
        onClick={goNext}
        className="lab5-inline-flex lab5-items-center lab5-gap-2 lab5-rounded-full lab5-bg-primary lab5-px-6 lab5-py-3 lab5-text-base lab5-font-bold lab5-text-primary-foreground lab5-shadow-sm lab5-transition-all lab5-hover-brightness"
      >
        เริ่มเรียนรู้
        <ArrowRight className="lab5-size-5" />
      </button>
    </div>
  )
}

/**
 * ไอคอนพร้อมป้ายชื่อในหน้าบทนำ
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {React.ReactNode} props.icon ไอคอนที่จะแสดง
 * @param {string} props.label ข้อความใต้ไอคอน
 * @return {JSX.Element} กล่องไอคอนพร้อมป้ายชื่อ
 * @author StealthTrade Team
 */
function IntroPill({ icon, label }) {
  return (
    <div className="lab5-flex lab5-flex-col lab5-items-center lab5-gap-2">
      <div className="lab5-flex lab5-size-14 lab5-items-center lab5-justify-center lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-text-primary lab5-shadow-sm">
        {icon}
      </div>
      <span className="lab5-text-xs lab5-font-semibold lab5-text-muted-foreground">{label}</span>
    </div>
  )
}

const step1Choices = ["ต้องส่งทั้งหมด", "ไม่จำเป็น ถ้าเรามีหลักฐานที่ตรวจสอบได้"]

/**
 * ขั้นที่ 1: ตั้งโจทย์ปัญหาและให้ผู้เรียนเลือกคำตอบ
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 1
 * @author StealthTrade Team
 */
function Step1WhyMerkle() {
  const { step1Answer, isStep1Correct, answerStep1 } = useLab05()

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="ปัญหาที่เราจะแก้"
        title="เราจะพิสูจน์ได้อย่างไรว่า Order อยู่ในชุดข้อมูล?"
        description="สมมติคุณต้องการพิสูจน์ว่า Order B อยู่ในข้อมูลจริง แต่คุณไม่อยากเปิดเผย Order A, C และ D ทั้งหมด เราจะทำยังไงดี?"
      />

      <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3 lab5-sm:grid-cols-4">
        {orders.map((order) => (
          <div key={order.id} className="lab5-rounded-xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-3 lab5-text-center">
            <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">{order.label}</p>
            <p className="lab5-mt-1 lab5-font-mono lab5-text-11 lab5-leading-tight lab5-text-muted-foreground">{order.value}</p>
            {order.id === "B" && <p className="lab5-mt-1 lab5-text-11 lab5-font-semibold lab5-text-primary">← เราต้องการพิสูจน์</p>}
          </div>
        ))}
      </div>

      <p className="lab5-text-sm lab5-font-semibold lab5-text-foreground">คุณคิดว่าเราต้องส่ง Order ทั้ง 4 รายการให้คนตรวจสอบไหม?</p>

      <div className="lab5-space-y-3">
        {step1Choices.map((choice, index) => {
          const isSelected = step1Answer === index
          const choiceState = step1Answer === index ? (index === 1 ? "correct" : "incorrect") : "default"
          return (
            <ChoiceCard key={index} isSelected={isSelected} choiceState={choiceState} onClick={() => answerStep1(index)}>
              <span className="lab5-text-sm lab5-font-semibold lab5-text-foreground">{choice}</span>
            </ChoiceCard>
          )
        })}
      </div>

      <HintButton>ลองคิดดูว่า ถ้าเราไม่อยากเปิดเผยข้อมูลทั้งหมด เราจะพิสูจน์ได้อย่างไรโดยใช้ข้อมูลบางส่วน?</HintButton>

      {step1Answer !== null && !isStep1Correct && (
        <FeedbackCard variant="incorrect" title="ลองอีกครั้ง">
          ลองคิดใหม่ครับ — เราอยากเปิดเผยข้อมูลให้น้อยที่สุดเท่าที่จะทำได้
        </FeedbackCard>
      )}

      {isStep1Correct && (
        <FeedbackCard variant="correct" title="ถูกต้อง">
          เราไม่จำเป็นต้องเปิดเผยทุก Order เราสามารถส่ง Order ที่ต้องการพิสูจน์ + หลักฐานบางส่วน
          แล้วให้คนตรวจสอบคำนวณกลับไปหา Root ได้
        </FeedbackCard>
      )}
    </div>
  )
}

/**
 * ขั้นที่ 2: สร้างรอยประทับ (hash) ให้แต่ละ Order
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 2
 * @author StealthTrade Team
 */
function Step2HashOrders() {
  const { tree, hashedLeaves, revealHash } = useLab05()
  const hashedCount = hashedLeaves.filter(Boolean).length
  const isAllHashed = hashedLeaves.every(Boolean)

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="สร้างรอยประทับ"
        title="ก่อนสร้างต้นไม้ เราต้องทำให้แต่ละ Order เป็น “รอยประทับ” ก่อน"
        description="เรามี Order A, B, C และ D — ก่อนจะเอาข้อมูลมาสร้างต้นไม้ เราต้องเปลี่ยนแต่ละ Order ให้เป็น Hash ก่อน มองว่า Hash คือ “รอยประทับดิจิทัล” ของข้อมูลก็ได้"
      />

      <MentorMessage message="ทำไปทำไม? เพราะเราจะเอา Hash เหล่านี้ไปจับคู่กันในขั้นต่อไป เพื่อสร้างต้นไม้" />

      <div className="lab5-space-y-3">
        {orders.map((order, index) => {
          const isHashed = hashedLeaves[index]
          return (
            <div key={order.id} className="lab5-rounded-xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4">
              <div className="lab5-flex lab5-flex-wrap lab5-items-center lab5-justify-between lab5-gap-3">
                <div>
                  <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">{order.label}</p>
                  <p className="lab5-font-mono lab5-text-xs lab5-text-muted-foreground">{order.value}</p>
                </div>

                {!isHashed ? (
                  <button
                    type="button"
                    onClick={() => revealHash(index)}
                    className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-bg-primary lab5-px-4 lab5-py-2 lab5-text-sm lab5-font-semibold lab5-text-primary-foreground lab5-transition-all lab5-hover-brightness"
                  >
                    <Sparkles className="lab5-size-4" />
                    สร้างรอยประทับ
                  </button>
                ) : (
                  <div className="lab5-flex lab5-items-center lab5-gap-2 lab5-text-xs lab5-font-semibold lab5-text-success">
                    <ArrowDown className="lab5-size-4" />
                    <span className="lab5-hidden lab5-sm:inline">Hash (SHA-256)</span>
                  </div>
                )}
              </div>

              {isHashed && tree && (
                <div className="lab5-animate-merge-up lab5-mt-3 lab5-border-t lab5-border-border lab5-pt-3">
                  <HashValue hash={tree.leafHashes[index]} label={`รอยประทับของ ${order.label} =`} tone="primary" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {hashedCount === 1 && !isAllHashed && (
        <FeedbackCard variant="correct" title="รอยประทับแรกเสร็จแล้ว">
          Order นี้ถูกเปลี่ยนเป็น Hash แล้ว ถ้าข้อมูลเดิมเหมือนเดิม Hash ก็จะได้ค่าเดิม
          จุดสำคัญคือ ถ้าข้อมูลเปลี่ยนแม้เพียงเล็กน้อย Hash ที่ได้ก็จะเปลี่ยนตาม —
          ลองสร้างรอยประทับให้ Order ที่เหลือ →
        </FeedbackCard>
      )}

      {isAllHashed && (
        <FeedbackCard variant="correct" title="ครบทั้ง 4 ใบแล้ว">
          Order แต่ละใบถูกเปลี่ยนเป็นรอยประทับดิจิทัล (Hash) ด้วย SHA-256 แล้ว ตอนนี้เรามี Hash ของ
          Order A, B, C และ D พร้อมนำไปประกอบเป็นต้นไม้แล้ว
        </FeedbackCard>
      )}
    </div>
  )
}

/**
 * ปุ่มสำหรับจับคู่ hash ในขั้นที่ 3
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {string} props.label ข้อความบนปุ่มก่อนจับคู่
 * @param {boolean} props.isDone จับคู่แล้วหรือยัง
 * @param {Function} props.onClick ฟังก์ชันที่เรียกเมื่อกด
 * @return {JSX.Element} ปุ่มจับคู่
 * @author StealthTrade Team
 */
function PairButton({ label, isDone, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDone}
      className={
        isDone
          ? "lab5-flex lab5-items-center lab5-justify-center lab5-gap-2 lab5-rounded-xl lab5-border-2 lab5-border-success lab5-bg-success-soft lab5-px-4 lab5-py-3 lab5-text-sm lab5-font-bold lab5-text-success"
          : "lab5-flex lab5-items-center lab5-justify-center lab5-gap-2 lab5-rounded-xl lab5-border-2 lab5-border-primary lab5-bg-surface lab5-px-4 lab5-py-3 lab5-text-sm lab5-font-bold lab5-text-primary lab5-transition-all lab5-hover-primary-soft"
      }
    >
      <Link2 className="lab5-size-4" />
      {isDone ? "รวมแล้ว" : label}
    </button>
  )
}

/**
 * ขั้นที่ 3: ประกอบต้นไม้โดยจับคู่ hash จนได้ root
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 3
 * @author StealthTrade Team
 */
function Step3BuildTree() {
  const { builtPairs, isRootBuilt, buildPair, buildRoot } = useLab05()
  const isFirstPairDone = builtPairs[0] && !builtPairs[1]
  const hasBothPairs = builtPairs.every(Boolean)

  const nodeStateMap = {
    "leaf-0": "neutral",
    "leaf-1": "neutral",
    "leaf-2": "neutral",
    "leaf-3": "neutral",
    "mid-0": builtPairs[0] ? "path" : "neutral",
    "mid-1": builtPairs[1] ? "path" : "neutral",
    root: isRootBuilt ? "success" : "neutral",
  }

  const visibilityMap = {
    "mid-0": builtPairs[0],
    "mid-1": builtPairs[1],
    root: isRootBuilt,
  }

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="ประกอบต้นไม้"
        title="เอา Hash มาจับคู่กัน เพื่อสร้างต้นไม้"
        description="ตอนนี้เรามีรอยประทับของ Order A, B, C และ D แล้ว ขั้นต่อไป เราจะเอา Hash ทีละ 2 ตัวมารวมกัน"
      />

      <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
        <MerkleTreeDiagram nodeStateMap={nodeStateMap} visibilityMap={visibilityMap} hashNodeIds={["leaf-0", "leaf-1", "leaf-2", "leaf-3", "mid-0", "mid-1", "root"]} />
      </div>

      {!hasBothPairs && (
        <div className="lab5-space-y-3">
          <p className="lab5-text-center lab5-text-sm lab5-font-medium lab5-text-foreground">คุณคิดว่า คู่แรกควรเป็นคู่ไหน?</p>
          <div className="lab5-grid lab5-gap-3 lab5-sm:grid-cols-2">
            <PairButton label="จับคู่ H(A) + H(B)" isDone={builtPairs[0]} onClick={() => buildPair(0)} />
            <PairButton label="จับคู่ H(C) + H(D)" isDone={builtPairs[1]} onClick={() => buildPair(1)} />
          </div>
        </div>
      )}

      {isFirstPairDone && (
        <FeedbackCard variant="correct" title="ได้ Hash ของคู่แรกแล้ว">
          เราเอา Hash ของ A และ B มารวมกัน แล้วสร้าง Hash ใหม่ที่แทน “คู่ A+B” — ทำแบบเดียวกันกับ C
          และ D ต่อได้เลย
        </FeedbackCard>
      )}

      {hasBothPairs && !isRootBuilt && (
        <div className="lab5-animate-merge-up lab5-space-y-3">
          <FeedbackCard variant="correct" title="ครบทั้งสองคู่แล้ว">ตอนนี้เรามี Hash ที่แทนข้อมูลเป็นคู่แล้ว</FeedbackCard>
          <MentorMessage message="ตอนนี้เรายังมี 2 Hash — ถ้าอยากได้ Hash เดียวที่สรุปข้อมูลทั้ง 4 Order เราต้องรวม 2 คู่นี้อีกครั้ง" />
          <button
            type="button"
            onClick={buildRoot}
            className="lab5-mx-auto lab5-flex lab5-items-center lab5-gap-2 lab5-rounded-full lab5-bg-primary lab5-px-6 lab5-py-3 lab5-text-sm lab5-font-bold lab5-text-primary-foreground lab5-shadow-sm lab5-transition-all lab5-hover-brightness"
          >
            <Link2 className="lab5-size-4" />
            รวม H(A+B) + H(C+D) เป็น Root
          </button>
        </div>
      )}

      <HintButton>
        Parent hash เกิดจากการนำ Hash ของคู่ลูกมารวมกันแล้วสร้างรอยประทับใหม่ เราจับคู่แบบนี้ไปเรื่อย
        ๆ จนเหลือ Hash เดียว นั่นคือ Root
      </HintButton>

      {isRootBuilt && (
        <FeedbackCard variant="correct" title="ต้นไม้สมบูรณ์แล้ว">
          <p>
            Root คือ Hash เดียวที่สรุปข้อมูลทั้งหมดในต้นไม้ — เราเรียกมันว่า{" "}
            <span className="lab5-font-semibold">Root (Merkle Root)</span> ถ้าข้อมูลใบใดใบหนึ่งเปลี่ยน
            Root ก็จะเปลี่ยนตามทันที
          </p>
          <p className="lab5-mt-2 lab5-font-mono lab5-text-xs lab5-text-foreground-60">
            Order → Hash → จับเป็นคู่ → Hash ใหม่ → รวมต่อ → Root
          </p>
        </FeedbackCard>
      )}
    </div>
  )
}

/**
 * ขั้นที่ 4: เลือก Order ที่ต้องการพิสูจน์
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 4
 * @author StealthTrade Team
 */
function Step4SelectTarget() {
  const { selectedLeaf, selectLeaf } = useLab05()

  const nodeStateMap = selectedLeaf !== null ? { [`leaf-${selectedLeaf}`]: "target" } : {}

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="เลือกสิ่งที่จะพิสูจน์"
        title="ตอนนี้เราจะลองพิสูจน์ Order หนึ่งรายการ"
        description="เลือก Order หนึ่งรายการที่คุณอยากพิสูจน์ว่า “อยู่ในต้นไม้นี้จริง”"
      />

      <div className="lab5-grid lab5-grid-cols-2 lab5-gap-3 lab5-sm:grid-cols-4">
        {orders.map((order, index) => (
          <ChoiceCard key={order.id} isSelected={selectedLeaf === index} onClick={() => selectLeaf(index)} className="lab5-text-center">
            <div className="lab5-flex lab5-flex-col lab5-items-center lab5-gap-1">
              <Target className={JoinClassNames("lab5-size-5", selectedLeaf === index ? "lab5-text-primary" : "lab5-text-muted-foreground")} />
              <span className="lab5-text-sm lab5-font-bold lab5-text-foreground">{order.label}</span>
              <span className="lab5-font-mono lab5-text-10 lab5-leading-tight lab5-text-muted-foreground">{order.value}</span>
            </div>
          </ChoiceCard>
        ))}
      </div>

      {selectedLeaf !== null && (
        <div className="lab5-animate-merge-up lab5-space-y-2 lab5-text-center">
          <p className="lab5-text-sm lab5-font-semibold lab5-text-primary">
            คุณเลือก {orders[selectedLeaf].label} — ต่อไปเราจะหาหลักฐานที่จำเป็นเพื่อเดินจาก{" "}
            {orders[selectedLeaf].label} กลับไปหา Root
          </p>
          <div className="lab5-mx-auto lab5-inline-flex lab5-flex-col lab5-items-center lab5-rounded-xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-px-4 lab5-py-2">
            <span className="lab5-text-xs lab5-text-muted-foreground">ข้อมูลที่เรากำลังพิสูจน์</span>
            <span className="lab5-text-xs lab5-font-semibold lab5-text-foreground">Target: {orders[selectedLeaf].label}</span>
          </div>
        </div>
      )}

      <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
        <MerkleTreeDiagram nodeStateMap={nodeStateMap} />
      </div>
    </div>
  )
}

/**
 * ขั้นที่ 5: หา sibling hash ที่อยู่บนเส้นทางหลักฐาน (Authentication Path)
 *
 * @return {JSX.Element|null} เนื้อหาขั้นที่ 5 หรือ null ถ้ายังไม่ได้เลือก Order
 * @author StealthTrade Team
 */
function Step5AuthPath() {
  const { selectedLeaf, authPathSteps, foundSiblings, findSibling } = useLab05()
  const [wrongNodeId, setWrongNodeId] = useState(null)
  const [flash, setFlash] = useState("idle")

  if (selectedLeaf === null) return null

  const isComplete = authPathSteps.length > 0 && authPathSteps.every((pathStep) => foundSiblings.includes(pathStep.nodeId))
  // เรียงตามลำดับที่คลิกจริง (ไม่ใช่ลำดับใน authPathSteps) เพื่อให้คำอธิบายตรงกับสิ่งที่ผู้เรียนทำ
  const orderedFoundSiblings = foundSiblings
    .map((nodeId) => authPathSteps.find((pathStep) => pathStep.nodeId === nodeId))
    .filter(Boolean)

  const parentIndex = selectedLeaf >> 1
  const parentLabel = parentIndex === 0 ? "H(A+B)" : "H(C+D)"
  const targetLabel = orders[selectedLeaf].label

  const nodeStateMap = {
    [`leaf-${selectedLeaf}`]: "target",
  }
  for (const nodeId of foundSiblings) nodeStateMap[nodeId] = "path"
  // ให้เส้นทางไปหา parent สว่างขึ้นเมื่อเจอ sibling แล้ว เพื่อให้เห็นการเดินขึ้น
  if (foundSiblings.length >= 1) nodeStateMap[`mid-${selectedLeaf >> 1}`] = "path"
  if (isComplete) nodeStateMap.root = "path"
  if (wrongNodeId) nodeStateMap[wrongNodeId] = "error"

  const clickableNodeIds = ["leaf-0", "leaf-1", "leaf-2", "leaf-3", "mid-0", "mid-1"].filter(
    (nodeId) => nodeId !== `leaf-${selectedLeaf}` && !foundSiblings.includes(nodeId),
  )

  /**
   * จัดการเมื่อผู้เรียนคลิกโหนด: แสดงผลตอบรับว่าถูกหรือผิด
   *
   * @param {string} nodeId รหัสโหนดที่ถูกคลิก
   * @return {void}
   * @author StealthTrade Team
   */
  const handleClick = (nodeId) => {
    const result = findSibling(nodeId)
    if (result === "wrong") {
      setWrongNodeId(nodeId)
      setFlash("wrong")
      setTimeout(() => setWrongNodeId(null), 700)
    } else if (result === "correct") {
      setFlash("correct")
    }
  }

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="หา Hash ข้าง ๆ"
        title={`เรามี ${targetLabel} แล้ว แต่ยังขาดอะไร?`}
        description={`ตอนนี้เรารู้ Hash ของ ${targetLabel} แล้ว ถ้าเราต้องการคำนวณต่อขึ้นไปหา Root เราต้องรู้ “Hash ของข้อมูลข้าง ๆ” ด้วย`}
      />

      <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
        <MerkleTreeDiagram nodeStateMap={nodeStateMap} clickableNodeIds={clickableNodeIds} onNodeClick={handleClick} />
      </div>

      <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4">
        <p className="lab5-text-xs lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-muted-foreground">
          {isComplete ? "เส้นทางหลักฐาน (Authentication Path)" : "หลักฐานที่ต้องหา"}
        </p>
        {orderedFoundSiblings.length === 0 ? (
          <p className="lab5-mt-2 lab5-text-sm lab5-text-muted-foreground">
            ยังไม่ได้เลือก — ลองคลิก Hash ที่อยู่ข้าง ๆ {targetLabel} บนต้นไม้ด้านบน
          </p>
        ) : (
          <ol className="lab5-mt-2 lab5-space-y-2">
            {orderedFoundSiblings.map((sibling, index) => (
              <li key={sibling.nodeId} className="lab5-flex lab5-items-center lab5-gap-2">
                <span className="lab5-flex lab5-size-5 lab5-items-center lab5-justify-center lab5-rounded-full lab5-bg-primary lab5-text-11 lab5-font-bold lab5-text-primary-foreground">
                  {index + 1}
                </span>
                <HashValue hash={sibling.hash} label={`${sibling.label} =`} tone="primary" />
              </li>
            ))}
          </ol>
        )}
      </div>

      <HintButton>
        เราต้องการเฉพาะ Hash ที่อยู่ข้าง ๆ เส้นทางที่เดินจาก {targetLabel} ไปหา Root ไม่ใช่ทุก Hash
        ในต้นไม้
      </HintButton>

      {flash === "wrong" && !isComplete && (
        <FeedbackCard variant="incorrect" title="ลองอีกครั้ง">
          ลองดูตำแหน่งของ Order ที่เรากำลังพิสูจน์อีกครั้ง เราต้องหา Hash ที่อยู่ “ข้าง ๆ เส้นทาง”
          ของมัน
        </FeedbackCard>
      )}

      {orderedFoundSiblings.length === 1 && !isComplete && (
        <FeedbackCard variant="correct" title="ถูกต้อง">
          {orderedFoundSiblings[0].label} คือ Hash ของข้อมูลที่อยู่ข้าง ๆ {targetLabel} เราเรียกสิ่งนี้ว่า{" "}
          <span className="lab5-font-semibold lab5-text-primary">Sibling Hash</span> — เมื่อได้ {parentLabel}{" "}
          แล้ว เรายังต้องใช้ Hash ของคู่ไหนเพื่อไปถึง Root?
        </FeedbackCard>
      )}

      {isComplete && (
        <FeedbackCard variant="correct" title="ครบเส้นทางแล้ว">
          ตอนนี้เรามี Hash ที่จำเป็นครบแล้ว Hash เหล่านี้รวมกันเป็น{" "}
          <span className="lab5-font-semibold lab5-text-primary">เส้นทางหลักฐาน (Authentication Path)</span>{" "}
          — เราจะใช้แค่นี้เพื่อคำนวณกลับไปหา Root
        </FeedbackCard>
      )}
    </div>
  )
}

/**
 * ขั้นที่ 6: คำนวณจาก Order กลับไปหา Root ทีละขั้น
 *
 * @return {JSX.Element|null} เนื้อหาขั้นที่ 6 หรือ null ถ้ายังไม่พร้อมแสดง
 * @author StealthTrade Team
 */
function Step6RebuildRoot() {
  const { tree, selectedLeaf, authPathSteps, isInterimComputed, isRootComputed, computeInterim, computeRootStep } = useLab05()

  if (selectedLeaf === null || !tree || authPathSteps.length < 2) return null

  const parentIndex = selectedLeaf >> 1
  const interimHash = tree.midHashes[parentIndex]
  const leafSibling = authPathSteps[0]
  const midSibling = authPathSteps[1]
  const targetId = orders[selectedLeaf].id
  const targetLabel = orders[selectedLeaf].label
  const pairLabel = parentIndex === 0 ? "A+B" : "C+D"

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="เดินกลับไปหา Root"
        title="ลองคำนวณกลับไปหา Root"
        description={`เรามี ${targetLabel} และ Hash ของข้อมูลข้าง ๆ ที่จำเป็นครบแล้ว ทีนี้ลองใช้หลักฐานนี้คำนวณกลับขึ้นไปทีละขั้น`}
      />

      <div className="lab5-grid lab5-gap-4 lab5-lg:grid-cols-3fr">
        {/* Target */}
        <div className="lab5-rounded-2xl lab5-border lab5-border-primary-30 lab5-bg-primary-soft lab5-p-4">
          <p className="lab5-text-xs lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-primary">Order ที่เรากำลังพิสูจน์</p>
          <p className="lab5-text-10 lab5-font-medium lab5-text-primary-70">(Target)</p>
          <p className="lab5-mt-1 lab5-text-sm lab5-font-bold lab5-text-foreground">{targetLabel}</p>
          <div className="lab5-mt-2">
            <HashValue hash={tree.leafHashes[selectedLeaf]} label={`H(${targetId}) =`} tone="primary" />
          </div>
        </div>

        {/* Compute steps */}
        <div className="lab5-space-y-3 lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4">
          <div className="lab5-space-y-2">
            <p className="lab5-text-sm lab5-font-semibold lab5-text-foreground">
              ขั้นแรก: ใช้ Hash ของ {targetLabel} และ Hash ของข้อมูลที่อยู่ข้าง ๆ ({leafSibling.label})
              เพื่อสร้าง Hash ของคู่ {pairLabel}
            </p>
            <p className="lab5-font-mono lab5-text-xs lab5-text-muted-foreground">
              {leafSibling.position === "left" ? `${leafSibling.label} + H(${targetId})` : `H(${targetId}) + ${leafSibling.label}`}
            </p>
            {!isInterimComputed ? (
              <button
                type="button"
                onClick={computeInterim}
                className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-bg-primary lab5-px-4 lab5-py-2 lab5-text-sm lab5-font-semibold lab5-text-primary-foreground lab5-transition-all lab5-hover-brightness"
              >
                <Calculator className="lab5-size-4" />
                คำนวณขั้นแรก
              </button>
            ) : (
              <div className="lab5-animate-merge-up lab5-space-y-1">
                <ArrowDown className="lab5-mb-1 lab5-size-4 lab5-text-success" />
                <HashValue hash={interimHash} label={`${parentIndex === 0 ? "H(A+B)" : "H(C+D)"} =`} tone="success" />
                <p className="lab5-text-xs lab5-text-muted-foreground">ได้ Hash ของคู่ {pairLabel} แล้ว</p>
              </div>
            )}
          </div>

          {isInterimComputed && (
            <div className="lab5-animate-merge-up lab5-space-y-2 lab5-border-t lab5-border-border lab5-pt-3">
              <p className="lab5-text-sm lab5-font-semibold lab5-text-foreground">
                ขั้นต่อไป: เอา Hash ของคู่ {pairLabel} มารวมกับ {midSibling.label} เพื่อสร้าง Root
              </p>
              <p className="lab5-font-mono lab5-text-xs lab5-text-muted-foreground">
                {midSibling.position === "left"
                  ? `${midSibling.label} + ${parentIndex === 0 ? "H(A+B)" : "H(C+D)"}`
                  : `${parentIndex === 0 ? "H(A+B)" : "H(C+D)"} + ${midSibling.label}`}
              </p>
              {!isRootComputed ? (
                <button
                  type="button"
                  onClick={computeRootStep}
                  className="lab5-inline-flex lab5-items-center lab5-gap-1.5 lab5-rounded-full lab5-bg-primary lab5-px-4 lab5-py-2 lab5-text-sm lab5-font-semibold lab5-text-primary-foreground lab5-transition-all lab5-hover-brightness"
                >
                  <Calculator className="lab5-size-4" />
                  คำนวณ Root
                </button>
              ) : (
                <div className="lab5-animate-merge-up lab5-space-y-1">
                  <ArrowDown className="lab5-mb-1 lab5-size-4 lab5-text-success" />
                  <HashValue hash={tree.root} label="Root ที่เราคำนวณได้ =" tone="success" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Committed root */}
        <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
          <p className="lab5-text-xs lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-muted-foreground">Root ที่บันทึกไว้</p>
          <p className="lab5-text-10 lab5-font-medium lab5-text-muted-foreground-70">(Committed Root)</p>
          <div className="lab5-mt-2">
            <HashValue hash={tree.root} tone={isRootComputed ? "success" : "neutral"} />
          </div>
        </div>
      </div>

      {isRootComputed && (
        <FeedbackCard variant="success" title="✓ Root ทั้งสองค่าเหมือนกัน">
          <p>
            แปลว่าเราสามารถใช้หลักฐานที่มีคำนวณกลับไปยัง Root เดิมได้ จึงยืนยันได้ว่า{" "}
            <span className="lab5-font-semibold">{targetLabel} อยู่ในต้นไม้นี้จริง</span>
          </p>
          <p className="lab5-mt-2 lab5-text-xs lab5-text-foreground-70">
            การพิสูจน์แบบนี้เรียกว่า <span className="lab5-font-semibold">Inclusion Proof</span> หรือ
            “หลักฐานว่า Order นี้อยู่ในต้นไม้”
          </p>
        </FeedbackCard>
      )}
    </div>
  )
}

/**
 * ขั้นที่ 7: ทดสอบการปลอมแปลงข้อมูลแล้วดูว่า root เปลี่ยนตามหรือไม่
 *
 * @return {JSX.Element|null} เนื้อหาขั้นที่ 7 หรือ null ถ้ายังไม่พร้อมแสดง
 * @author StealthTrade Team
 */
function Step7Tamper() {
  const { tree, selectedLeaf, authPathSteps, isTamperMode, toggleTamper } = useLab05()
  const [tamperedRoot, setTamperedRoot] = useState(null)

  const midSibling = authPathSteps[1]

  useEffect(() => {
    let isActive = true
    if (!tree || selectedLeaf === null || authPathSteps.length < 2) return
    const tamperedSiblings = [authPathSteps[0], { ...midSibling, hash: TamperHash(midSibling.hash) }]
    ComputeRootFromProof(tree.leafHashes[selectedLeaf], tamperedSiblings).then((proofResult) => {
      if (isActive) setTamperedRoot(proofResult.root)
    })
    return () => {
      isActive = false
    }
  }, [tree, selectedLeaf, authPathSteps, midSibling])

  if (selectedLeaf === null || !tree) return null

  const shownRoot = isTamperMode && tamperedRoot ? tamperedRoot : tree.root
  const isMatching = !isTamperMode
  const targetLabel = orders[selectedLeaf].label

  return (
    <div className="lab5-space-y-6">
      <LessonHeading
        sectionLabel="ทดสอบการปลอมแปลง"
        title="ถ้า Order ถูกเปลี่ยน เราจะจับได้ไหม?"
        description={`ลองสมมติว่ามีคนแอบเปลี่ยนข้อมูลของ Order ในฝั่ง ${midSibling?.label} เล็กน้อย แล้วดูว่าเราจับได้ไหม`}
      />

      <div className="lab5-flex lab5-items-center lab5-justify-between lab5-gap-4 lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4">
        <div>
          <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">ดัดแปลงข้อมูลฝั่ง {midSibling?.label}</p>
          <p className="lab5-text-xs lab5-text-muted-foreground">ลองสวิตช์เพื่อจำลองว่ามีคนแก้ไขข้อมูลเพียงเล็กน้อยฝั่งนี้</p>
        </div>
        <button type="button" role="switch" aria-checked={isTamperMode} onClick={toggleTamper} className={JoinClassNames("lab5-switch", isTamperMode && "lab5-switch--on")}>
          <span className="lab5-switch-knob" />
        </button>
      </div>

      {isTamperMode && (
        <div className="lab5-animate-merge-up lab5-rounded-2xl lab5-border lab5-border-danger-30 lab5-bg-danger-soft-40 lab5-p-4">
          <p className="lab5-text-center lab5-text-xs lab5-font-semibold lab5-uppercase lab5-tracking-wide lab5-text-danger">สิ่งที่เกิดขึ้น</p>
          <div className="lab5-mt-2 lab5-flex lab5-flex-col lab5-items-center lab5-gap-1 lab5-text-sm lab5-text-foreground">
            <span>ข้อมูลของ Order เปลี่ยน</span>
            <span className="lab5-text-muted-foreground">↓</span>
            <span>Hash ของ Order นั้นเปลี่ยน</span>
            <span className="lab5-text-muted-foreground">↓</span>
            <span>Hash ของคู่นั้นเปลี่ยน</span>
            <span className="lab5-text-muted-foreground">↓</span>
            <span className="lab5-font-semibold lab5-text-danger">Root ที่คำนวณใหม่เปลี่ยน</span>
          </div>
        </div>
      )}

      <div className="lab5-grid lab5-gap-3 lab5-sm:grid-cols-2">
        <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
          <p className="lab5-text-xs lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-muted-foreground">Root ที่คำนวณใหม่</p>
          <p className="lab5-text-10 lab5-font-medium lab5-text-muted-foreground-70">(Computed Root)</p>
          <div className="lab5-mt-2">
            <HashValue hash={shownRoot} tone={isMatching ? "success" : "danger"} />
          </div>
        </div>
        <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
          <p className="lab5-text-xs lab5-font-bold lab5-uppercase lab5-tracking-wide lab5-text-muted-foreground">Root ที่บันทึกไว้ตั้งแต่ต้น</p>
          <p className="lab5-text-10 lab5-font-medium lab5-text-muted-foreground-70">(Committed Root)</p>
          <div className="lab5-mt-2">
            <HashValue hash={tree.root} tone="neutral" />
          </div>
        </div>
      </div>

      {isMatching ? (
        <FeedbackCard variant="success" title="✓ ตรงกัน">
          ตอนนี้ Hash ทุกตัวถูกต้อง Root ที่คำนวณใหม่จึงเท่ากับ Root ที่บันทึกไว้ตั้งแต่ต้น —{" "}
          {targetLabel} ได้รับการพิสูจน์แล้ว
        </FeedbackCard>
      ) : (
        <FeedbackCard variant="incorrect" title="✗ Root ไม่ตรงกัน">
          <span className="lab5-inline-flex lab5-items-center lab5-gap-1.5">
            <AlertTriangle className="lab5-size-4 lab5-shrink-0" />
            หลักฐานจึงตรวจสอบไม่ผ่าน
          </span>{" "}
          — แค่เปลี่ยนข้อมูลต้นทางเพียงเล็กน้อย Hash ที่เกี่ยวข้องจะเปลี่ยนตาม ทำให้ Root เปลี่ยนด้วย
          การดัดแปลงข้อมูลจึงถูกตรวจจับได้ทันที นี่คือหัวใจความปลอดภัยของ Merkle Tree
        </FeedbackCard>
      )}
    </div>
  )
}

/**
 * ขั้นที่ 8: สรุปประโยชน์ของ Merkle Tree
 *
 * @return {JSX.Element} เนื้อหาขั้นที่ 8
 * @author StealthTrade Team
 */
function Step8Efficiency() {
  const { selectedLeaf, authPathSteps, reset, goToStep } = useLab05()

  const targetLabel = selectedLeaf !== null ? orders[selectedLeaf].label : "Order A"
  const proofItems = selectedLeaf !== null ? [targetLabel, ...authPathSteps.map((pathStep) => `Hash ของ ${pathStep.label}`)] : [targetLabel]

  return (
    <div className="lab5-space-y-6">
      <LessonHeading sectionLabel="สรุปประโยชน์" title="แล้วมันช่วยอะไรเรา?" />

      <div className="lab5-grid lab5-gap-4 lab5-sm:grid-cols-2">
        <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface-soft lab5-p-4">
          <p className="lab5-text-sm lab5-font-bold lab5-text-foreground">ต้องเปิดเผยทุกอย่าง</p>
          <ul className="lab5-mt-2 lab5-space-y-1.5">
            {orders.map((order) => (
              <li key={order.id} className="lab5-rounded-lg lab5-bg-surface lab5-px-3 lab5-py-1.5 lab5-text-sm lab5-text-foreground">
                {order.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="lab5-rounded-2xl lab5-border lab5-border-primary-30 lab5-bg-primary-soft lab5-p-4">
          <p className="lab5-text-sm lab5-font-bold lab5-text-primary">พิสูจน์ {targetLabel} ด้วย Merkle Tree</p>
          <ul className="lab5-mt-2 lab5-space-y-1.5">
            {proofItems.map((item) => (
              <li key={item} className="lab5-rounded-lg lab5-bg-surface lab5-px-3 lab5-py-1.5 lab5-text-sm lab5-text-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="lab5-text-center lab5-text-pretty lab5-text-sm lab5-leading-relaxed lab5-text-foreground-80">
        เราไม่จำเป็นต้องเปิดเผยข้อมูลของ Order อื่นทั้งหมด เราใช้แค่ข้อมูลที่อยู่บนเส้นทางกลับไปหา Root
        เท่านั้น
      </p>

      <div className="lab5-rounded-2xl lab5-border lab5-border-border lab5-bg-surface lab5-p-4 lab5-text-center">
        <p className="lab5-text-pretty lab5-text-sm lab5-leading-relaxed lab5-text-foreground-80">
          ยิ่งต้นไม้ใหญ่ เส้นทางที่ต้องใช้ก็เพิ่มทีละชั้นเท่านั้น ไม่ต้องส่งข้อมูลทุก Order ทั้งหมด —
          ต้นไม้ใหญ่ขึ้น แต่หลักฐานหนึ่งรายการไม่จำเป็นต้องโตเท่ากับข้อมูลทั้งหมด
        </p>
        <p className="lab5-mt-1 lab5-text-xs lab5-text-muted-foreground">
          ทางเทคนิคเรียกขนาดของหลักฐานนี้ว่า <span className="lab5-font-mono">O(log n)</span>
        </p>
      </div>

      <div className="lab5-flex lab5-flex-col lab5-items-center lab5-gap-4 lab5-rounded-2xl lab5-border lab5-border-success-30 lab5-bg-success-soft lab5-p-6 lab5-text-center">
        <PartyPopper className="lab5-size-8 lab5-text-success" />
        <div>
          <p className="lab5-text-lg lab5-font-extrabold lab5-text-foreground">เรียนจบ Lab 05 แล้ว</p>
          <p className="lab5-mt-1 lab5-text-pretty lab5-text-sm lab5-leading-relaxed lab5-text-foreground-70">
            คุณสร้างต้นไม้ พิสูจน์การมีอยู่ของข้อมูล และตรวจจับการปลอมแปลงได้ด้วยตัวเองแล้ว
          </p>
        </div>
        <div className="lab5-flex lab5-flex-wrap lab5-justify-center lab5-gap-3">
          <button
            type="button"
            onClick={() => goToStep(4)}
            className="lab5-inline-flex lab5-items-center lab5-gap-2 lab5-rounded-full lab5-border lab5-border-primary-30 lab5-bg-surface lab5-px-4 lab5-py-2 lab5-text-sm lab5-font-semibold lab5-text-primary lab5-transition-colors lab5-hover-primary-soft"
          >
            ลองพิสูจน์ Order อื่น
          </button>
          <button
            type="button"
            onClick={reset}
            className="lab5-inline-flex lab5-items-center lab5-gap-2 lab5-rounded-full lab5-border lab5-border-border lab5-bg-surface lab5-px-4 lab5-py-2 lab5-text-sm lab5-font-semibold lab5-text-muted-foreground lab5-transition-colors lab5-hover-surface-soft"
          >
            <RotateCcw className="lab5-size-4" />
            เริ่มใหม่ทั้งหมด
          </button>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   lab-container — ประกอบทุกอย่างเข้าด้วยกัน
   ========================================================================== */

/**
 * เลือกเนื้อหาของขั้นตามหมายเลขขั้น
 *
 * @param {Object} props พร็อพของคอมโพเนนต์
 * @param {number} props.step หมายเลขขั้น (0-8)
 * @return {JSX.Element|null} เนื้อหาของขั้นนั้น หรือ null ถ้าหมายเลขไม่ถูกต้อง
 * @author StealthTrade Team
 */
function StepContent({ step }) {
  switch (step) {
    case 0:
      return <StepIntro />
    case 1:
      return <Step1WhyMerkle />
    case 2:
      return <Step2HashOrders />
    case 3:
      return <Step3BuildTree />
    case 4:
      return <Step4SelectTarget />
    case 5:
      return <Step5AuthPath />
    case 6:
      return <Step6RebuildRoot />
    case 7:
      return <Step7Tamper />
    case 8:
      return <Step8Efficiency />
    default:
      return null
  }
}

/**
 * โครงหน้าของบทเรียน: ส่วนหัว (ความคืบหน้า + คำศัพท์) เนื้อหา และแถบนำทาง
 *
 * @return {JSX.Element} โครงหน้าของบทเรียน
 * @author StealthTrade Team
 */
function LabContainer() {
  const { currentStep } = useLab05()
  const isIntro = currentStep === 0

  return (
    <div className="lab5-flex lab5-min-h-dvh lab5-flex-col">
      {!isIntro && (
        <header className="lab5-sticky lab5-top-0 lab5-z-10 lab5-border-b lab5-border-border lab5-bg-surface-85 lab5-px-4 lab5-py-3 lab5-backdrop-blur-sm">
          <div className="lab5-mx-auto lab5-max-w-3xl lab5-space-y-2">
            <LabProgress />
            <Glossary />
          </div>
        </header>
      )}

      <main className="lab5-flex-1 lab5-px-4 lab5-py-6 lab5-sm:py-10">
        <div className="lab5-mx-auto lab5-flex lab5-max-w-3xl lab5-flex-col lab5-gap-6">
          {!isIntro && <MentorMessage message={STEP_META[currentStep].mentor} />}
          {/* รีเมานต์เนื้อหาขั้นใหม่ทุกครั้งที่เปลี่ยน เพื่อให้แอนิเมชันเข้าเล่นซ้ำ */}
          <div key={currentStep} className="lab5-animate-merge-up">
            <StepContent step={currentStep} />
          </div>
        </div>
      </main>

      <LabNavigation />
    </div>
  )
}

/* ==========================================================================
   Lab5 — คอมโพเนนต์หลักที่ export ออกไปใช้งาน
   ========================================================================== */

/**
 * คอมโพเนนต์หลักของ Lab 05 (Merkle Trees)
 *
 * @return {JSX.Element} หน้าบทเรียนทั้งหมดพร้อม Provider
 * @author StealthTrade Team
 */
export default function Lab5() {
  return (
    <div className="lab5">
      <Lab05Provider>
        <LabContainer />
      </Lab05Provider>
    </div>
  )
}
