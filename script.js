const LIFF_ID = "2009264673-Gyv71UJl"; // 末尾が小文字のL
let peer = null;
let conn = null;
let myHand = "";
let enemyHand = "";

// 1. ID生成
function generateFormatId() {
    const p1 = Math.floor(1000 + Math.random() * 9000);
    const p2 = Math.floor(10 + Math.random() * 90);
    return `${p1}-${p2}`;
}

// 2. 初期化処理
async function init() {
    const display = document.getElementById('my-id-display');
    try {
        // LIFF初期化
        await liff.init({ liffId: LIFF_ID });

        // ログインチェック（LINE内ブラウザでは必須）
        if (!liff.isLoggedIn()) {
            liff.login();
            return; 
        }

        // ログイン成功後にPeer作成を開始
        const myId = generateFormatId();
        setupPeer(myId);

    } catch (err) {
        console.error(err);
        display.innerText = "エラー: " + err.message;
        display.style.color = "red";
    }
}

// 3. Peerのセットアップ
function setupPeer(id) {
    const display = document.getElementById('my-id-display');
    
    // PeerJSの作成
    peer = new Peer(id);

    peer.on('open', (openedId) => {
        display.innerText = openedId;
    });

    peer.on('connection', (incomingConn) => {
        conn = incomingConn;
        setupConnHandlers();
        startBattle();
    });

    peer.on('error', (err) => {
        console.error("PeerError:", err.type);
        if (err.type === 'unavailable-id') {
            setupPeer(generateFormatId()); // ID被りは再生成
        } else {
            alert("接続エラー: " + err.type);
        }
    });
}

// 4. 接続（自分から相手へ）
function connectToPeer() {
    const rId = document.getElementById('remote-id').value.trim();
    if (!rId) return alert("相手のIDを入れてね");
    if (!peer) return alert("まだ準備ができていません");
    
    conn = peer.connect(rId);
    conn.on('open', () => {
        setupConnHandlers();
        startBattle();
    });
}

// 5. 通信ハンドラ
function setupConnHandlers() {
    conn.on('data', (data) => {
        enemyHand = data;
        checkResult();
    });
    conn.on('close', () => {
        alert("対戦相手との接続が切れました");
        location.reload();
    });
}

// 6. 対戦開始・判定処理（以下は変更なし）
function startBattle() {
    document.getElementById('setup-area').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
}

function sendHand(hand) {
    if (myHand || !conn) return;
    myHand = hand;
    conn.send(hand);
    document.getElementById('status').innerText = `あなたは ${hand} を出しました。\n相手の選択を待っています...`;
    checkResult();
}

function checkResult() {
    if (myHand && enemyHand) {
        let resText = (myHand === enemyHand) ? "あいこ！ 🤝" :
            ((myHand === "✊" && enemyHand === "✌️") || (myHand === "✌️" && enemyHand === "🖐️") || (myHand === "🖐️" && enemyHand === "✊")) ? "あなたの勝ち！ 🏆" : "あなたの負け... 😭";
        document.getElementById('status').innerText = "結果発表！";
        document.getElementById('result').innerHTML = `<div style="font-size:3rem; margin:10px 0;">${myHand} vs ${enemyHand}</div><h2 style="color: #d32f2f;">${resText}</h2>`;
    }
}

// 起動
init();
