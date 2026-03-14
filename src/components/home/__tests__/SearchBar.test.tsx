// src/components/home/__tests__/SearchBar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from '../SearchBar'

const noop = () => {}

describe('SearchBar', () => {
  it('renderiza o input de busca', () => {
    render(<SearchBar value="" onChange={noop} onSearch={noop} geoStatus="idle" onRequestLocation={noop} />)
    expect(screen.getByPlaceholderText(/Que serviço/i)).toBeInTheDocument()
  })

  it('chama onSearch ao pressionar Enter', () => {
    const onSearch = jest.fn()
    render(<SearchBar value="freio" onChange={noop} onSearch={onSearch} geoStatus="idle" onRequestLocation={noop} />)
    fireEvent.keyDown(screen.getByPlaceholderText(/Que serviço/i), { key: 'Enter' })
    expect(onSearch).toHaveBeenCalledWith('freio')
  })

  it('chama onRequestLocation ao clicar no botão de localização', () => {
    const onRequestLocation = jest.fn()
    render(<SearchBar value="" onChange={noop} onSearch={noop} geoStatus="idle" onRequestLocation={onRequestLocation} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onRequestLocation).toHaveBeenCalled()
  })

  it('mostra "Localização detectada" quando geoStatus é success', () => {
    render(<SearchBar value="" onChange={noop} onSearch={noop} geoStatus="success" onRequestLocation={noop} />)
    expect(screen.getByText(/Localização detectada/i)).toBeInTheDocument()
  })
})
