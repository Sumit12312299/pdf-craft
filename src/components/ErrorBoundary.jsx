import React from 'react';

/**
 * Global Error Boundary component to prevent React component tree unmounting
 * and blank white screens on runtime exceptions.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PDFCraft Caught Component Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: 'var(--bg-primary, #ffffff)',
          color: 'var(--text-primary, #0f172a)',
          textAlign: 'center',
          fontFamily: '"Plus Jakarta Sans", sans-serif'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            padding: '2.5rem',
            backgroundColor: 'var(--bg-secondary, #f8fafc)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄❤️</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              PDFCraft encountered a transient runtime error. Don't worry, your files remain completely private and safe on your device.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: 'var(--accent-color, #ea580c)',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.75rem',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Reload PDFCraft
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
