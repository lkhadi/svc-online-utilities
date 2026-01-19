import { ref } from 'vue'

export interface TitleCaseOptions {
  style: 'ap' | 'chicago' | 'mla' | 'apa' | 'wikipedia' | 'sentence' | 'capitalize'
}

export interface HistoryItem {
  id: string
  originalText: string
  transformedText: string
  transformationType: string
  timestamp: number
}

export interface TransformationResult {
  result: string
  success: boolean
  error?: string
}

export interface TextTransformationOptions {
  preserveCase?: boolean
  trimWhitespace?: boolean
  handleSpecialChars?: boolean
}

const fontMappings = {
  bold: {
    lowercase: '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇',
    uppercase: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭',
    numbers: '𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵'
  },
  italic: {
    lowercase: '𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻',
    uppercase: '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕',
    numbers: '𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗'
  },
  gothic: {
    lowercase: '𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷',
    uppercase: '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ',
    numbers: '𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵'
  },
  script: {
    lowercase: '𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏',
    uppercase: '𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵',
    numbers: '𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗'
  },
  monospace: {
    lowercase: '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣',
    uppercase: '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉',
    numbers: '𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿'
  },
  doublestruck: {
    lowercase: '𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫',
    uppercase: '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ',
    numbers: '𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡'
  },
  bubble: {
    lowercase: '\u24D0\u24D1\u24D2\u24D3\u24D4\u24D5\u24D6\u24D7\u24D8\u24D9\u24DA\u24DB\u24DC\u24DD\u24DE\u24DF\u24E0\u24E1\u24E2\u24E3\u24E4\u24E5\u24E6\u24E7\u24E8\u24E9',
    uppercase: '\u24B6\u24B7\u24B8\u24B9\u24BA\u24BB\u24BC\u24BD\u24BE\u24BF\u24C0\u24C1\u24C2\u24C3\u24C4\u24C5\u24C6\u24C7\u24C8\u24C9\u24CA\u24CB\u24CC\u24CD\u24CE\u24CF',
    numbers: '\u2460\u2461\u2462\u2463\u2464\u2465\u2466\u2467\u2468\u2469'
  },
  circled: {
    lowercase: '\u2090\u1D62\u2098\u1DA4\u2091\u1D4D\u2092\u1D5E\u2095\u1D60\u1D61\u1DA0\u2094\u1D61\u1DA6\u2093\u1DA7\u1D5B\u2096\u2099\u1D58',
    uppercase: '\u24B6\u24B7\u24B8\u24B9\u24BA\u24BB\u24BC\u24BD\u24BE\u24BF\u24C0\u24C1\u24C2\u24C3\u24C4\u24C5\u24C6\u24C7\u24C8\u24C9\u24CA\u24CB\u24CC\u24CD\u24CE\u24CF',
    numbers: '\u24EA\u2460\u2461\u2462\u2463\u2464\u2465\u2466\u2467\u2468'
  },
  squared: {
    lowercase: '\u2090\u1D62\u2098\u1DA4\u2091\u1D4D\u2092\u1D5E\u2095\u1D60\u1D61\u1DA0\u2094\u1D61\u1DA6\u2093\u1DA7\u1D5B\u2096\u2099\u1D58',
    uppercase: '\u1D2C\u1D2E\u1D30\u1D31\u1D33\u1D34\u1D35\u1D36\u1D37\u1D38\u1D39\u1D3A\u1D3B\u1D3C\u1D3D\u1D3E\u1D3F\u1D40\u1D41\u1D42\u1D43\u1D44\u1D45\u1D46\u1D47\u1D48\u1D49\u1D4A',
    numbers: '\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089'
  },
  upsideDown: {
    lowercase: '\u0250q\u0254p\u01DD\u025F\u0263h\u0131\u027E\u05DFuno\u027F\u0279s\u0287nd\u0287x\u028Ez',
    uppercase: '\u2200q\u0184\u0150\u01F6\u2130\u01DE\u05DFH\u0131\u0298\u2141\u2141WNO\u0180Q\u1D1AS\u22A5\u2229\u0418MX\u2148Z',
    numbers: '0\u0263\u0253\u03B5\u05449\u21416'
  }
}

const normalChars = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789'
}

export type TitleCaseStyle = 'ap' | 'chicago' | 'mla' | 'apa' | 'wikipedia' | 'sentence' | 'capitalize'

const titleCaseRules = {
  ap: {
    minorWords: ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'in', 'of', 'as'],
    capitalizeFirst: true,
    capitalizeLast: true,
    capitalizeAll: false,
    capitalizeLongWords: false,
    longWordThreshold: 0,
    capitalizeHyphenated: false
  } as const,
  chicago: {
    minorWords: ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'in', 'of', 'as'],
    capitalizeFirst: true,
    capitalizeLast: true,
    capitalizeAll: false,
    capitalizeLongWords: true,
    longWordThreshold: 4,
    capitalizeHyphenated: false
  } as const,
  mla: {
    minorWords: ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'in', 'of', 'as'],
    capitalizeFirst: true,
    capitalizeLast: true,
    capitalizeAll: false,
    capitalizeLongWords: false,
    longWordThreshold: 0,
    capitalizeHyphenated: false
  } as const,
  apa: {
    minorWords: ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'in', 'of', 'as'],
    capitalizeFirst: true,
    capitalizeLast: true,
    capitalizeAll: false,
    capitalizeLongWords: false,
    longWordThreshold: 0,
    capitalizeHyphenated: false
  } as const,
  wikipedia: {
    minorWords: ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'in', 'of', 'as'],
    capitalizeFirst: true,
    capitalizeLast: true,
    capitalizeAll: false,
    capitalizeLongWords: false,
    longWordThreshold: 0,
    capitalizeHyphenated: true
  } as const,
  sentence: {
    minorWords: [],
    capitalizeFirst: true,
    capitalizeLast: false,
    capitalizeAll: false,
    capitalizeLongWords: false,
    longWordThreshold: 0,
    capitalizeHyphenated: false
  } as const,
  capitalize: {
    minorWords: [],
    capitalizeFirst: true,
    capitalizeLast: true,
    capitalizeAll: true,
    capitalizeLongWords: false,
    longWordThreshold: 0,
    capitalizeHyphenated: false
  } as const
}

export function transformText(
  text: string,
  fontType: keyof typeof fontMappings,
  options: TextTransformationOptions = {}
): TransformationResult {
  try {
    const {
      preserveCase = true,
      trimWhitespace = true,
      handleSpecialChars = true
    } = options

    let processedText = text

    if (handleSpecialChars) {
      processedText = normalizeSpecialChars(processedText)
    }

    if (trimWhitespace) {
      processedText = processedText.trim()
    }

    const mapping = fontMappings[fontType]
    let result = ''

    for (let i = 0; i < processedText.length; i++) {
      const char = processedText[i]
      let transformed = char

      if (preserveCase) {
        const upperIndex = normalChars.uppercase.indexOf(char)
        const lowerIndex = normalChars.lowercase.indexOf(char)
        const numberIndex = normalChars.numbers.indexOf(char)

        if (upperIndex !== -1) {
          transformed = mapping.uppercase[upperIndex] || char
        } else if (lowerIndex !== -1) {
          transformed = mapping.lowercase[lowerIndex] || char
        } else if (numberIndex !== -1) {
          transformed = mapping.numbers[numberIndex] || char
        }
      } else {
        const lowerChar = char.toLowerCase()
        const index = normalChars.lowercase.indexOf(lowerChar)

        if (index !== -1) {
          transformed = mapping.lowercase[index] || char
        } else {
          const numberIndex = normalChars.numbers.indexOf(char)
          if (numberIndex !== -1) {
            transformed = mapping.numbers[numberIndex] || char
          }
        }
      }

      result += transformed
    }

    return { result, success: true }
  } catch (error) {
    return {
      result: text,
      success: false,
      error: error instanceof Error ? error.message : 'Transformation failed'
    }
  }
}

export function toTitleCase(
  text: string,
  style: TitleCaseStyle = 'ap'
): TransformationResult {
  try {
    const rules = titleCaseRules[style]
    const words = text.split(/\s+/)
    const processedWords: string[] = []

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const isHyphenated = word.includes('-')
      const parts = isHyphenated ? word.split('-') : [word]
      const processedParts: string[] = []

      for (let j = 0; j < parts.length; j++) {
        let part = parts[j].toLowerCase()

        const isFirstWord = i === 0
        const isLastWord = i === words.length - 1
        const isFirstPart = j === 0
        const isLastPart = j === parts.length - 1

        const shouldCapitalize =
          rules.capitalizeAll ||
          (rules.capitalizeFirst && isFirstWord) ||
          (rules.capitalizeLast && isLastWord && isHyphenated ? isLastPart : isLastWord) ||
          (!(rules.minorWords as readonly string[]).includes(part) && part.length > 0) ||
          (rules.capitalizeLongWords && part.length > rules.longWordThreshold) ||
          (rules.capitalizeHyphenated && isHyphenated)

        if (shouldCapitalize && part.length > 0) {
          const isAllCaps = parts[j] === parts[j].toUpperCase()
          if (isAllCaps && part.length > 1) {
            part = parts[j]
          } else {
            part = part.charAt(0).toUpperCase() + part.slice(1)
          }
        }

        processedParts.push(part)
      }

      processedWords.push(processedParts.join('-'))
    }

    return { result: processedWords.join(' '), success: true }
  } catch (error) {
    return {
      result: text,
      success: false,
      error: error instanceof Error ? error.message : 'Title case conversion failed'
    }
  }
}

export function invertCase(text: string): TransformationResult {
  try {
    let result = ''
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      result += char === char.toLowerCase() ? char.toUpperCase() : char.toLowerCase()
    }
    return { result, success: true }
  } catch (error) {
    return {
      result: text,
      success: false,
      error: error instanceof Error ? error.message : 'Case inversion failed'
    }
  }
}

export function toUpperCase(text: string): TransformationResult {
  try {
    return { result: text.toUpperCase(), success: true }
  } catch (error) {
    return {
      result: text,
      success: false,
      error: error instanceof Error ? error.message : 'Uppercase conversion failed'
    }
  }
}

export function toLowerCase(text: string): TransformationResult {
  try {
    return { result: text.toLowerCase(), success: true }
  } catch (error) {
    return {
      result: text,
      success: false,
      error: error instanceof Error ? error.message : 'Lowercase conversion failed'
    }
  }
}

export function toCamelCase(text: string): TransformationResult {
  try {
    const words = text
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase()
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })

    return { result: words.join(''), success: true }
  } catch (error) {
    return {
      result: text,
      success: false,
      error: error instanceof Error ? error.message : 'Camel case conversion failed'
    }
  }
}

export function toPascalCase(text: string): TransformationResult {
  try {
    const words = text
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())

    return { result: words.join(''), success: true }
  } catch (error) {
    return {
      result: text,
      success: false,
      error: error instanceof Error ? error.message : 'Pascal case conversion failed'
    }
  }
}

export function toSnakeCase(text: string): TransformationResult {
  try {
    const words = text
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .map(word => word.toLowerCase())

    return { result: words.join('_'), success: true }
  } catch (error) {
    return {
      result: text,
      success: false,
      error: error instanceof Error ? error.message : 'Snake case conversion failed'
    }
  }
}

export function toKebabCase(text: string): TransformationResult {
  try {
    const words = text
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .map(word => word.toLowerCase())

    return { result: words.join('-'), success: true }
  } catch (error) {
    return {
      result: text,
      success: false,
      error: error instanceof Error ? error.message : 'Kebab case conversion failed'
    }
  }
}

export function removeExtraSpaces(text: string): TransformationResult {
  try {
    return { result: text.replace(/\s+/g, ' ').trim(), success: true }
  } catch (error) {
    return {
      result: text,
      success: false,
      error: error instanceof Error ? error.message : 'Space removal failed'
    }
  }
}

export function reverseText(text: string): TransformationResult {
  try {
    return { result: text.split('').reverse().join(''), success: true }
  } catch (error) {
    return {
      result: text,
      success: false,
      error: error instanceof Error ? error.message : 'Text reversal failed'
    }
  }
}

export function normalizeSpecialChars(text: string): string {
  const replacements: Record<string, string> = {
    '\u2014': '-',
    '\u2013': '-',
    '\u2019': "'",
    '\u2018': "'",
    '\u201C': '"',
    '\u201D': '"',
    '\u2026': '...',
    '\u00AB': '"',
    '\u00BB': '"',
    '\u2039': "'",
    '\u203A': "'",
    '\u00A1': 'i',
    '\u00BF': '?'
  }

  return text.split('').map(char => replacements[char] || char).join('')
}

export function countCharacters(text: string): {
  total: number
  letters: number
  numbers: number
  spaces: number
  special: number
} {
  let letters = 0
  let numbers = 0
  let spaces = 0
  let special = 0

  for (const char of text) {
    if (/[a-zA-Z]/.test(char)) {
      letters++
    } else if (/[0-9]/.test(char)) {
      numbers++
    } else if (/\s/.test(char)) {
      spaces++
    } else {
      special++
    }
  }

  return {
    total: text.length,
    letters,
    numbers,
    spaces,
    special
  }
}

export function validateText(text: string): {
  isValid: boolean
  hasUnsupportedChars: boolean
  warning?: string
} {
  const supportedRanges = [
    [0x0000, 0x007F],
    [0x0080, 0x00FF],
    [0x1D400, 0x1D7FF],
    [0x2100, 0x214F]
  ]

  let hasUnsupportedChars = false
  let unsupportedChars: string[] = []

  for (const char of text) {
    const code = char.codePointAt(0) || 0
    const isSupported = supportedRanges.some(([start, end]) => code >= start && code <= end)

    if (!isSupported && !/\s/.test(char)) {
      hasUnsupportedChars = true
      if (!unsupportedChars.includes(char)) {
        unsupportedChars.push(char)
      }
    }
  }

  return {
    isValid: !hasUnsupportedChars,
    hasUnsupportedChars,
    warning: hasUnsupportedChars
      ? `Some characters may not render correctly: ${unsupportedChars.slice(0, 5).join(', ')}${unsupportedChars.length > 5 ? '...' : ''}`
      : undefined
  }
}

export function useTextTransformation() {
  const text = ref('')
  const transformedText = ref('')
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  const history = ref<HistoryItem[]>([])
  const maxHistorySize = 50

  const loadHistory = () => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('text-transformation-history')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          history.value = parsed
        }
      }
    } catch (e) {
      console.error('Failed to load history:', e)
    }
  }

  const saveHistory = () => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('text-transformation-history', JSON.stringify(history.value))
    } catch (e) {
      console.error('Failed to save history:', e)
    }
  }

  const addToHistory = (original: string, transformed: string, type: string) => {
    const item: HistoryItem = {
      id: Date.now().toString(),
      originalText: original,
      transformedText: transformed,
      transformationType: type,
      timestamp: Date.now()
    }

    history.value.unshift(item)

    if (history.value.length > maxHistorySize) {
      history.value = history.value.slice(0, maxHistorySize)
    }

    saveHistory()
  }

  const removeFromHistory = (id: string) => {
    history.value = history.value.filter(item => item.id !== id)
    saveHistory()
  }

  const clearHistory = () => {
    history.value = []
    saveHistory()
  }

  const applyFont = (fontType: keyof typeof fontMappings, options?: TextTransformationOptions) => {
    if (!text.value) return

    isProcessing.value = true
    error.value = null

    try {
      const result = transformText(text.value, fontType, options)
      transformedText.value = result.result

      if (result.error) {
        error.value = result.error
      } else {
        addToHistory(text.value, result.result, `Font: ${fontType}`)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Font transformation failed'
    } finally {
      isProcessing.value = false
    }
  }

  const applyTitleCase = (style: TitleCaseStyle = 'ap') => {
    if (!text.value) return

    isProcessing.value = true
    error.value = null

    try {
      const result = toTitleCase(text.value, style)
      transformedText.value = result.result

      if (result.error) {
        error.value = result.error
      } else {
        addToHistory(text.value, result.result, `Title Case: ${style}`)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Title case conversion failed'
    } finally {
      isProcessing.value = false
    }
  }

  const applyCase = (caseType: 'upper' | 'lower' | 'invert') => {
    if (!text.value) return

    isProcessing.value = true
    error.value = null

    try {
      let result: TransformationResult

      switch (caseType) {
        case 'upper':
          result = toUpperCase(text.value)
          break
        case 'lower':
          result = toLowerCase(text.value)
          break
        case 'invert':
          result = invertCase(text.value)
          break
        default:
          result = { result: text.value, success: true }
      }

      transformedText.value = result.result

      if (result.error) {
        error.value = result.error
      } else {
        addToHistory(text.value, result.result, `Case: ${caseType}`)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Case transformation failed'
    } finally {
      isProcessing.value = false
    }
  }

  const applyNaming = (namingType: 'camel' | 'pascal' | 'snake' | 'kebab') => {
    if (!text.value) return

    isProcessing.value = true
    error.value = null

    try {
      let result: TransformationResult

      switch (namingType) {
        case 'camel':
          result = toCamelCase(text.value)
          break
        case 'pascal':
          result = toPascalCase(text.value)
          break
        case 'snake':
          result = toSnakeCase(text.value)
          break
        case 'kebab':
          result = toKebabCase(text.value)
          break
        default:
          result = { result: text.value, success: true }
      }

      transformedText.value = result.result

      if (result.error) {
        error.value = result.error
      } else {
        addToHistory(text.value, result.result, `Naming: ${namingType}`)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Naming convention conversion failed'
    } finally {
      isProcessing.value = false
    }
  }

  const applyUtility = (utilityType: 'removeSpaces' | 'reverse' | 'normalize') => {
    if (!text.value) return

    isProcessing.value = true
    error.value = null

    try {
      let result: TransformationResult

      switch (utilityType) {
        case 'removeSpaces':
          result = removeExtraSpaces(text.value)
          break
        case 'reverse':
          result = reverseText(text.value)
          break
        case 'normalize':
          result = { result: normalizeSpecialChars(text.value), success: true }
          break
        default:
          result = { result: text.value, success: true }
      }

      transformedText.value = result.result

      if (result.error) {
        error.value = result.error
      } else {
        addToHistory(text.value, result.result, `Utility: ${utilityType}`)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Utility transformation failed'
    } finally {
      isProcessing.value = false
    }
  }

  const copyToClipboard = async (content: string = transformedText.value): Promise<boolean> => {
    if (!content) return false

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(content)
        return true
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = content
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textarea)
        return successful
      }
    } catch (e) {
      console.error('Copy failed:', e)
      return false
    }
  }

  const getCharacterCount = () => countCharacters(text.value)

  const validate = () => validateText(text.value)

  const reset = () => {
    text.value = ''
    transformedText.value = ''
    error.value = null
  }

  loadHistory()

  return {
    text,
    transformedText,
    isProcessing,
    error,
    history,
    fontMappings,
    titleCaseRules,
    applyFont,
    applyTitleCase,
    applyCase,
    applyNaming,
    applyUtility,
    copyToClipboard,
    getCharacterCount,
    validate,
    removeFromHistory,
    clearHistory,
    reset
  }
}
