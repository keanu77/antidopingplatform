function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>運動禁藥相關案例資料庫</h1>
      <p>測試版本 - 如果你看到這個訊息，表示部署成功了！</p>
      <div style={{ marginTop: '20px' }}>
        <button style={{ padding: '10px 20px', margin: '5px', fontSize: '16px' }}>
          首頁
        </button>
        <button style={{ padding: '10px 20px', margin: '5px', fontSize: '16px' }}>
          案例列表
        </button>
        <button style={{ padding: '10px 20px', margin: '5px', fontSize: '16px' }}>
          統計資料
        </button>
        <button style={{ padding: '10px 20px', margin: '5px', fontSize: '16px' }}>
          教育專區
        </button>
        <button style={{ padding: '10px 20px', margin: '5px', fontSize: '16px' }}>
          TUE專區
        </button>
      </div>
    </div>
  );
}

export default App;