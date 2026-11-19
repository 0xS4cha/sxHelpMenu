import { describe, expect, it } from 'vitest'
import { anchorStyle, groupOf } from './anchor'

const offset = { x: 2.5, y: 6 }

describe('groupOf', () => {
  it('groups by anchor and offset', () => {
    expect(groupOf({ position: 'bottom-right', offset }).key).toBe(groupOf({ position: 'bottom-right', offset }).key)
    expect(groupOf({ position: 'bottom-right', offset }).key).not.toBe(
      groupOf({ position: 'bottom-right', offset: { x: 30, y: 6 } }).key,
    )
    expect(groupOf({ position: 'bottom', offset }).key).not.toBe(groupOf({ position: 'bottom-right', offset }).key)
  })
})

describe('anchorStyle', () => {
  it('anchors bottom right from the edges and stacks upward', () => {
    const style = anchorStyle('bottom-right', offset, 1.2)
    expect(style.bottom).toBe('6vh')
    expect(style.right).toBe('2.5vw')
    expect(style.alignItems).toBe('flex-end')
    expect(style.flexDirection).toBe('column-reverse')
    expect(style.gap).toBe('1.2vh')
  })

  it('centers the middle anchors', () => {
    const style = anchorStyle('center', offset, 1)
    expect(style.top).toBe('calc(50% + 6vh)')
    expect(style.left).toBe('calc(50% + 2.5vw)')
    expect(style.transform).toBe('translateY(-50%) translateX(-50%)')
    expect(style.flexDirection).toBe('column')
  })

  it('places the side anchors', () => {
    expect(anchorStyle('left', offset, 1).left).toBe('2.5vw')
    expect(anchorStyle('top', offset, 1).top).toBe('6vh')
    expect(anchorStyle('top', offset, 1).alignItems).toBe('center')
  })
})
