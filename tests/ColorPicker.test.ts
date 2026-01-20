import { describe, it, expect } from 'vitest'
import { colord, extend } from 'colord'
import cmykPlugin from 'colord/plugins/cmyk'
import namesPlugin from 'colord/plugins/names'

extend([cmykPlugin, namesPlugin])

describe('Color Picker Logic', () => {
    it('should convert Hex to RGB correctly', () => {
        const hex = '#ff0000'
        const color = colord(hex)
        expect(color.toRgbString()).toBe('rgb(255, 0, 0)')
    })

    it('should convert Hex to HSL correctly', () => {
        const hex = '#00ff00'
        const color = colord(hex)
        expect(color.toHslString()).toBe('hsl(120, 100%, 50%)')
    })

    it('should convert Hex to CMYK correctly', () => {
        const hex = '#000000'
        const color = colord(hex)
        expect(color.toCmykString()).toBe('device-cmyk(0% 0% 0% 100%)')
    })

    it('should find the closest color name', () => {
        const hex = '#ff0000'
        const color = colord(hex)
        expect(color.toName({ closest: true })).toBe('red')
    })

    it('should handle invalid input gracefully', () => {
        const invalid = 'not-a-color'
        const color = colord(invalid)
        expect(color.isValid()).toBe(false)
    })
})
