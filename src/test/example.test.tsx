import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Simple component for testing
const TestComponent = () => <div>Testing setup works!</div>

describe('Test Setup', () => {
  it('should render a component', () => {
    render(<TestComponent />)
    expect(screen.getByText('Testing setup works!')).toBeInTheDocument()
  })

  it('should have jest-dom matchers available', () => {
    render(<TestComponent />)
    const element = screen.getByText('Testing setup works!')
    expect(element).toBeVisible()
  })
})
