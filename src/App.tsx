import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [showNames, setShowNames] = useState<'both' | 'name' | 'solfege' | 'none'>('none')
  const [showPitch, setShowPitch] = useState<boolean>(false)
  const [strictMode, setStrictMode] = useState<boolean>(true)
  const [staffMode, setStaffMode] = useState<'both' | 'treble' | 'bass'>('both')
  const [noteStartTime, setNoteStartTime] = useState<number | null>(null)
  const [successTime, setSuccessTime] = useState<number | null>(null)
  const [isError, setIsError] = useState<boolean>(false)
  const [showHelp, setShowHelp] = useState<boolean>(false)
  const keyboardRef = useRef<HTMLDivElement>(null)
  
  // 音符相关状态
  const [currentNote, setCurrentNote] = useState<{
    name: string;
    staff: 'treble' | 'bass';
    position: string;
  } | null>(null)
  
  // 音高频率映射
  const pitchFrequencies: Record<string, number> = {
    'B1': 61.74,
    'C2': 65.41,
    'C#2': 69.30,
    'D2': 73.42,
    'D#2': 77.78,
    'E2': 82.41,
    'F2': 87.31,
    'F#2': 92.50,
    'G2': 98.00,
    'G#2': 103.83,
    'A2': 110.00,
    'A#2': 116.54,
    'B2': 123.47,
    'C3': 130.81,
    'C#3': 138.59,
    'D3': 146.83,
    'D#3': 155.56,
    'E3': 164.81,
    'F3': 174.61,
    'F#3': 185.00,
    'G3': 196.00,
    'G#3': 207.65,
    'A3': 220.00,
    'A#3': 233.08,
    'B3': 246.94,
    'C4': 261.63,
    'C#4': 277.18,
    'D4': 293.66,
    'D#4': 311.13,
    'E4': 329.63,
    'F4': 349.23,
    'F#4': 369.99,
    'G4': 392.00,
    'G#4': 415.30,
    'A4': 440.00,
    'A#4': 466.16,
    'B4': 493.88,
    'C5': 523.25,
    'C#5': 554.37,
    'D5': 587.33,
    'D#5': 622.25,
    'E5': 659.25,
    'F5': 698.46,
    'F#5': 739.99,
    'G5': 783.99,
    'G#5': 830.61,
    'A5': 880.00,
    'A#5': 932.33,
    'B5': 987.77,
    'C6': 1046.50,
    'C#6': 1108.73,
    'D6': 1174.66,
  }
  
  // 获取当前音符的音高
  const getCurrentPitch = () => {
    if (!currentNote) return null
    return currentNote.name
  }
  
  // 定义可能的音符列表
  // 高音谱表音符（从下往上）
  // 低音谱表音符（从下往上）
  const notes = [
    // 高音谱表 - 从下往上：下加三间(G3)、下加二线(A3)、下加二间(B3)、下加一线(C4)、下加一间(D4)、第一线(E4)、第一间(F4)、第二线(G4)、第二间(A4)、第三线(B4)、第三间(C5)、第四线(D5)、第四间(E5)、第五线(F5)、第五间/上加一间(G5)、上加一线(A5)、上加二间(B5)、上加二线(C6)、上加三间(D6)
    { name: 'G3', staff: 'treble' as const, position: 'treble-g3' }, // 下加三间
    { name: 'A3', staff: 'treble' as const, position: 'treble-a3' }, // 下加二线
    { name: 'B3', staff: 'treble' as const, position: 'treble-b3' }, // 下加二间
    { name: 'C4', staff: 'treble' as const, position: 'treble-c4' }, // 下加一线（中央C）
    { name: 'D4', staff: 'treble' as const, position: 'treble-d4' }, // 下加一间（下加一线和第一线之间）
    { name: 'E4', staff: 'treble' as const, position: 'treble-e4' }, // 第一线
    { name: 'F4', staff: 'treble' as const, position: 'treble-f4' }, // 第一间（第一线和第二线之间）
    { name: 'G4', staff: 'treble' as const, position: 'treble-g4' }, // 第二线（高音谱号围绕的线）
    { name: 'A4', staff: 'treble' as const, position: 'treble-a4' }, // 第二间（第二线和第三线之间）
    { name: 'B4', staff: 'treble' as const, position: 'treble-b4' }, // 第三线
    { name: 'C5', staff: 'treble' as const, position: 'treble-c5' }, // 第三间（第三线和第四线之间）
    { name: 'D5', staff: 'treble' as const, position: 'treble-d5' }, // 第四线
    { name: 'E5', staff: 'treble' as const, position: 'treble-e5' }, // 第四间（第四线和第五线之间）
    { name: 'F5', staff: 'treble' as const, position: 'treble-f5' }, // 第五线
    { name: 'G5', staff: 'treble' as const, position: 'treble-g5' }, // 第五间/上加一间（第五线和上加一线之间）
    { name: 'A5', staff: 'treble' as const, position: 'treble-a5' }, // 上加一线
    { name: 'B5', staff: 'treble' as const, position: 'treble-b5' }, // 上加二间（上加一线和上加二线之间）
    { name: 'C6', staff: 'treble' as const, position: 'treble-c6' }, // 上加二线
    { name: 'D6', staff: 'treble' as const, position: 'treble-d6' }, // 上加三间
    
    // 低音谱表 - 从下往上：下加三间(B1)、下加二线(C2)、下加二间(D2)、下加一线(E2)、下加一间(F2)、第一线(G2)、第一间(A2)、第二线(B2)、第二间(C3)、第三线(D3)、第三间(E3)、第四线(F3)、第四间(G3)、第五线(A3)、第五间(B3)、上加一线(C4)、上加一间(D4)、上加二线(E4)、上加三间(F4)
    { name: 'B1', staff: 'bass' as const, position: 'bass-b1' }, // 下加三间
    { name: 'C2', staff: 'bass' as const, position: 'bass-c2' }, // 下加二线
    { name: 'D2', staff: 'bass' as const, position: 'bass-d2' }, // 下加二间
    { name: 'E2', staff: 'bass' as const, position: 'bass-e2' }, // 下加一线
    { name: 'F2', staff: 'bass' as const, position: 'bass-f2' }, // 下加一间（下加一线和第一线之间）
    { name: 'G2', staff: 'bass' as const, position: 'bass-g2' }, // 第一线
    { name: 'A2', staff: 'bass' as const, position: 'bass-a2' }, // 第一间（第一线和第二线之间）
    { name: 'B2', staff: 'bass' as const, position: 'bass-b2' }, // 第二线
    { name: 'C3', staff: 'bass' as const, position: 'bass-c3' }, // 第二间（第二线和第三线之间）
    { name: 'D3', staff: 'bass' as const, position: 'bass-d3' }, // 第三线
    { name: 'E3', staff: 'bass' as const, position: 'bass-e3' }, // 第三间（第三线和第四线之间）
    { name: 'F3', staff: 'bass' as const, position: 'bass-f3' }, // 第四线（低音谱号的点在两侧）
    { name: 'G3', staff: 'bass' as const, position: 'bass-g3' }, // 第四间（第四线和第五线之间）
    { name: 'A3', staff: 'bass' as const, position: 'bass-a3' }, // 第五线
    { name: 'B3', staff: 'bass' as const, position: 'bass-b3' }, // 第五间（第五线和上加一线之间）
    { name: 'C4', staff: 'bass' as const, position: 'bass-c4' }, // 上加一线（中央C）
    { name: 'D4', staff: 'bass' as const, position: 'bass-d4' }, // 上加一间（上加一线和上加二线之间）
    { name: 'E4', staff: 'bass' as const, position: 'bass-e4' }, // 上加二线
    { name: 'F4', staff: 'bass' as const, position: 'bass-f4' }, // 上加三间
  ]
  
  // 随机生成下一个音符
  const generateRandomNote = useCallback(() => {
    // 根据谱表选择模式过滤音符
    const filteredNotes = notes.filter(note => {
      if (staffMode === 'both') return true
      return note.staff === staffMode
    })
    
    const randomIndex = Math.floor(Math.random() * filteredNotes.length)
    setCurrentNote(filteredNotes[randomIndex])
    // 重置成功时间
    setSuccessTime(null)
    // 重置错误状态
    setIsError(false)
  }, [staffMode])
  
  // 当音符变化后，记录开始时间（音符实际展示后）
  useEffect(() => {
    if (currentNote) {
      setNoteStartTime(Date.now())
    }
  }, [currentNote])
  
  // 初始化时生成第一个音符
  useEffect(() => {
    generateRandomNote()
  }, [generateRandomNote])

  // 实体键盘按键映射
  const keyboardMap: Record<string, string> = {
    'a': 'A4',
    'b': 'B4',
    'c': 'C4',
    'd': 'D4',
    'e': 'E4',
    'f': 'F4',
    'g': 'G4',
  }

  // 处理键盘点击事件
  const handleKeyPress = useCallback((keyName: string, overrideStrictMode?: boolean) => {
    if (!currentNote) return
    
    // 提取按键名称的基本部分（去除升降号和八度编号）
    const keyBaseName = keyName.replace(/[#\d]/g, '')
    
    // 提取当前音符名称的基本部分（去除八度编号）
    const noteBaseName = currentNote.name.replace(/\d/g, '')
    
    // 比较按键名称与当前音符的名称
    // 在严格模式下，只有当按键名称与当前音符名称完全匹配时才算正确
    // 在非严格模式下，只要音名相同（不考虑升降号和八度）就算正确
    // 如果overrideStrictMode为true，则强制使用非严格模式
    const isCorrect = (overrideStrictMode ? false : strictMode) 
      ? keyName === currentNote.name 
      : keyBaseName === noteBaseName
    
    if (isCorrect) {
      // 计算用时
      if (noteStartTime) {
        const timeTaken = Date.now() - noteStartTime
        setSuccessTime(timeTaken)
      }
      // 2秒后生成下一个音符
      setTimeout(() => {
        generateRandomNote()
      }, 1500)
    } else {
      // 设置错误状态
      setIsError(true)
      // 2秒后清除错误状态
      setTimeout(() => {
        setIsError(false)
      }, 1500)
    }
  }, [currentNote, strictMode, generateRandomNote, noteStartTime])

  // 处理实体键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyName = keyboardMap[e.key.toLowerCase()]
      if (keyName) {
        // 按照非严格模式的规则处理实体键盘输入
        handleKeyPress(keyName, true) // 传入true作为第二个参数，强制使用非严格模式
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyPress])

  const pianoKeys = [
    // 第一八度（低音）
    { name: 'B1', solfege: 'Si', type: 'white' },
    { name: 'C2', solfege: 'Do', type: 'white' },
    { name: 'C#2', solfege: 'Do#', type: 'black' },
    { name: 'D2', solfege: 'Re', type: 'white' },
    { name: 'D#2', solfege: 'Re#', type: 'black' },
    { name: 'E2', solfege: 'Mi', type: 'white' },
    { name: 'F2', solfege: 'Fa', type: 'white' },
    { name: 'F#2', solfege: 'Fa#', type: 'black' },
    { name: 'G2', solfege: 'Sol', type: 'white' },
    { name: 'G#2', solfege: 'Sol#', type: 'black' },
    { name: 'A2', solfege: 'La', type: 'white' },
    { name: 'A#2', solfege: 'La#', type: 'black' },
    { name: 'B2', solfege: 'Si', type: 'white' },
    
    // 第二八度（中音）
    { name: 'C3', solfege: 'Do', type: 'white' },
    { name: 'C#3', solfege: 'Do#', type: 'black' },
    { name: 'D3', solfege: 'Re', type: 'white' },
    { name: 'D#3', solfege: 'Re#', type: 'black' },
    { name: 'E3', solfege: 'Mi', type: 'white' },
    { name: 'F3', solfege: 'Fa', type: 'white' },
    { name: 'F#3', solfege: 'Fa#', type: 'black' },
    { name: 'G3', solfege: 'Sol', type: 'white' },
    { name: 'G#3', solfege: 'Sol#', type: 'black' },
    { name: 'A3', solfege: 'La', type: 'white' },
    { name: 'A#3', solfege: 'La#', type: 'black' },
    { name: 'B3', solfege: 'Si', type: 'white' },
    
    // 第三八度（高音）
    { name: 'C4', solfege: 'Do', type: 'white' },
    { name: 'C#4', solfege: 'Do#', type: 'black' },
    { name: 'D4', solfege: 'Re', type: 'white' },
    { name: 'D#4', solfege: 'Re#', type: 'black' },
    { name: 'E4', solfege: 'Mi', type: 'white' },
    { name: 'F4', solfege: 'Fa', type: 'white' },
    { name: 'F#4', solfege: 'Fa#', type: 'black' },
    { name: 'G4', solfege: 'Sol', type: 'white' },
    { name: 'G#4', solfege: 'Sol#', type: 'black' },
    { name: 'A4', solfege: 'La', type: 'white' },
    { name: 'A#4', solfege: 'La#', type: 'black' },
    { name: 'B4', solfege: 'Si', type: 'white' },
    
    // 第四八度（更高音）
    { name: 'C5', solfege: 'Do', type: 'white' },
    { name: 'C#5', solfege: 'Do#', type: 'black' },
    { name: 'D5', solfege: 'Re', type: 'white' },
    { name: 'D#5', solfege: 'Re#', type: 'black' },
    { name: 'E5', solfege: 'Mi', type: 'white' },
    { name: 'F5', solfege: 'Fa', type: 'white' },
    { name: 'F#5', solfege: 'Fa#', type: 'black' },
    { name: 'G5', solfege: 'Sol', type: 'white' },
    { name: 'G#5', solfege: 'Sol#', type: 'black' },
    { name: 'A5', solfege: 'La', type: 'white' },
    { name: 'A#5', solfege: 'La#', type: 'black' },
    { name: 'B5', solfege: 'Si', type: 'white' },
    
    // 第五八度（最高音）
    { name: 'C6', solfege: 'Do', type: 'white' },
    { name: 'C#6', solfege: 'Do#', type: 'black' },
    { name: 'D6', solfege: 'Re', type: 'white' },
  ]

  useEffect(() => {
    const handleResize = () => {
      if (keyboardRef.current) {
        // 获取容器宽度，考虑app容器的padding
        const appElement = document.querySelector('.app')
        const containerWidth = appElement?.clientWidth || window.innerWidth
        
        // 正确计算键盘原始宽度：只考虑白色键、间隙和padding
        const whiteKeys = pianoKeys.filter(key => key.type === 'white').length
        const whiteKeyWidth = 60
        const gap = 2
        const padding = 40 // 左右各20px
        const keyboardWidth = whiteKeys * whiteKeyWidth + (whiteKeys - 1) * gap + padding
        
        // 考虑一些安全边距
        const availableWidth = containerWidth - 40 // 减去额外的边距
        
        if (availableWidth < keyboardWidth) {
          const scale = availableWidth / keyboardWidth
          keyboardRef.current.style.transform = `scale(${scale})`
        } else {
          keyboardRef.current.style.transform = 'scale(1)'
        }
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [pianoKeys])

  return (
    <div className="app">
      <h1>五线谱记忆小工具</h1>
      
      <div className="controls">
        <div className="control-group">
          <label>谱表选择：</label>
          <select 
            value={staffMode} 
            onChange={(e) => setStaffMode(e.target.value as 'both' | 'treble' | 'bass')}
          >
            <option value="both">双音谱表</option>
            <option value="treble">仅高音谱表</option>
            <option value="bass">仅低音谱表</option>
          </select>
        </div>
        <div className="control-group">
          <label>显示音高：</label>
          <input 
            type="checkbox" 
            checked={showPitch} 
            onChange={(e) => setShowPitch(e.target.checked)}
          />
        </div>
        <div className="control-group">
          <label>严格模式：</label>
          <input 
            type="checkbox" 
            checked={strictMode} 
            onChange={(e) => setStrictMode(e.target.checked)}
          />
        </div>
        <div className="control-group">
          <label>键盘音符展示：</label>
          <select 
            value={showNames} 
            onChange={(e) => setShowNames(e.target.value as 'both' | 'name' | 'solfege' | 'none')}
          >
            <option value="both">两者都显示</option>
            <option value="name">仅显示音名</option>
            <option value="solfege">仅显示唱名</option>
            <option value="none">都不展示</option>
          </select>
        </div>
        <div className="control-group help-button">
          <button 
            className="help-icon" 
            onClick={() => setShowHelp(true)}
          >
            ?
          </button>
        </div>
      </div>
      
      <div className="staff-container">
        <div className="grand-staff">
          {/* 连谱号 */}
          <div className="brace"></div>
          
          <div className="staffs-wrapper">
            {/* 高音谱表 */}
            <div className="staff treble-staff">
              {/* 上方额外线 */}
              <div className="extra-line top-1"></div>
              <div className="extra-line top-2"></div>
              
              <div className="clef treble"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="staff-line"></div>
              ))}
              
              {/* 下方额外线 */}
              <div className="extra-line bottom-1"></div>
              <div className="extra-line bottom-2"></div>
              
              {/* 随机音符 */}
              {currentNote && currentNote.staff === 'treble' && (
                <div className={`note-position ${currentNote.position}`}>
                  <div className="quarter-note"></div>
                  {showPitch && (
                    <div className="note-pitch">
                      {getCurrentPitch()}
                    </div>
                  )}
                  {successTime !== null && (
                    <div className="success-time">
                      {successTime}ms
                    </div>
                  )}
                  {isError && (
                    <div className="error-icon">
                      ×
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* 低音谱表 */}
            <div className="staff bass-staff">
              {/* 上方额外线 */}
              <div className="extra-line top-1"></div>
              <div className="extra-line top-2"></div>
              
              <div className="clef bass"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="staff-line"></div>
              ))}
              
              {/* 下方额外线 */}
              <div className="extra-line bottom-1"></div>
              <div className="extra-line bottom-2"></div>
              
              {/* 随机音符 */}
              {currentNote && currentNote.staff === 'bass' && (
                <div className={`note-position ${currentNote.position}`}>
                  <div className="quarter-note"></div>
                  {showPitch && (
                    <div className="note-pitch">
                      {getCurrentPitch()}
                    </div>
                  )}
                  {successTime !== null && (
                    <div className="success-time">
                      {successTime}ms
                    </div>
                  )}
                  {isError && (
                    <div className="error-icon">
                      ×
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          

        </div>
      </div>
      
      <div className="piano-container">
        <div className="piano-keyboard" ref={keyboardRef}>
          {(strictMode ? pianoKeys : pianoKeys.filter(key => {
            // 在非严格模式下，只显示包含中央C（C4）的八度
            const c4OctaveKeys = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
            return c4OctaveKeys.includes(key.name);
          })).map((key) => {
            const isCentralC = strictMode && key.name === 'C4';
            return (
              <div 
                key={key.name} 
                className={`piano-key ${key.type} ${isCentralC ? 'central-c' : ''}`}
                onClick={() => handleKeyPress(key.name)}
              >
                {showNames === 'both' && (
                  <>
                    <div className="note-name">{key.name}</div>
                    <div className="note-solfege">{key.solfege}</div>
                  </>
                )}
                {showNames === 'name' && (
                  <div className="note-name">{key.name}</div>
                )}
                {showNames === 'solfege' && (
                  <div className="note-solfege">{key.solfege}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 帮助弹窗 */}
      {showHelp && (
        <div className="help-modal">
          <div className="help-content">
            <button 
              className="close-button" 
              onClick={() => setShowHelp(false)}
            >
              ×
            </button>
            <h2>欢迎使用五线谱记忆小工具</h2>
            <br></br>
            <p>使用电脑键盘可以快速匹配，匹配规则为非严格模式，按键为 A B C D E F G</p>
            <br></br>
            <p>如有意见与建议，请联系开发者：<a href="mailto:zqlspace@163.com">zqlspace@163.com</a></p>
          </div>
        </div>
      )}
      </div>
  )
}

export default App
