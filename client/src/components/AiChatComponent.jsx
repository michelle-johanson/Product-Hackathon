export default function AiChatComponent() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px 20px',
      textAlign: 'center',
      color: '#666'
    }}>
      <div style={{
        fontSize: '4rem',
        marginBottom: '20px',
        opacity: 0.3
      }}>
        🤖
      </div>
      <h3 style={{
        fontSize: '1.2rem',
        marginBottom: '10px',
        fontWeight: 'bold',
        color: '#2c3e50'
      }}>
        AI Study Assistant
      </h3>
      <p style={{
        fontSize: '1rem',
        lineHeight: '1.6',
        maxWidth: '280px'
      }}>
        Coming Soon. This feature will use your group notes as context to answer questions.
      </p>
    </div>
  );
}
