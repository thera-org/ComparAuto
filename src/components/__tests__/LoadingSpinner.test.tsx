import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    const customText = 'Carregando dados...'
    render(<LoadingSpinner text={customText} />)
    
    expect(screen.getByText(customText)).toBeInTheDocument()
  })

  it('applies correct size classes', () => {
    const { container } = render(<LoadingSpinner size="lg" />)
    const spinner = container.querySelector('svg')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('w-8', 'h-8')
  })

  it('applies custom className', () => {
    const customClass = 'my-custom-class'
    render(<LoadingSpinner className={customClass} />)
    
    const container = screen.getByRole('status')
    expect(container).toHaveClass(customClass)
  })
})
