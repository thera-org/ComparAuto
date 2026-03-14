// src/components/home/__tests__/ServiceChips.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ServiceChips } from '../ServiceChips'

describe('ServiceChips', () => {
  it('renderiza os chips de serviços populares', () => {
    render(<ServiceChips selected={null} onSelect={() => {}} />)
    expect(screen.getByText('Troca de óleo')).toBeInTheDocument()
    expect(screen.getByText('Freio')).toBeInTheDocument()
  })

  it('chip selecionado tem estilo destacado', () => {
    render(<ServiceChips selected="Freio" onSelect={() => {}} />)
    const chip = screen.getByText('Freio').closest('button')
    expect(chip?.className).toMatch(/bg-rose-600/)
  })

  it('chama onSelect com o serviço ao clicar', () => {
    const onSelect = jest.fn()
    render(<ServiceChips selected={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Freio'))
    expect(onSelect).toHaveBeenCalledWith('Freio')
  })
})
