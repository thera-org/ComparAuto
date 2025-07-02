import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Simple Test', () => {
  it('should work', () => {
    const div = document.createElement('div')
    div.textContent = 'Hello World'
    expect(div.textContent).toBe('Hello World')
  })
})
