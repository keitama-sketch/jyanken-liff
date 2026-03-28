const LIFF_ID = "2009264673-Gyv71UJI"; // あなたのLIFF ID
let peer = null;
let conn = null;
let myHand = "";
let enemyHand = "";

// 1. xxxx-xx 形式のID生成
function generateFormatId() {
    const p1 = Math.floor(1000 + Math.random() * 9000); // 4桁
    const p2 = Math.floor(10 + Math.random() * 90);    // 2桁
    return `${p1}-${p2}`;
}

// 2. 初期化処理
async function init() {
    try {
        await liff.init({ liffId: LIFF_ID });
        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }

        const myId = generateFormatId();
        peer = new Peer(myId);

        peer.on('open', (id) => {
            document.getElementById('my-id-display').innerText = id;
        });

        // 相手からの接続を待機
        peer.on('connection', (incomingConn) => {
            conn = incomingConn;
            startBattle();
        });

        peer.on('error', (err) => {
            console.error(err);
            if (err.type === 'unavailable-id') {
                // IDが被ったら再生成
                init();
            } else {
                alert("エラーが発生しました: " + err.type);
            }
        });

    } catch (err) {
        console.error("LIFF初期化失敗", err);
    }
}

// 3. 自分から相手に接続
function connectToPeer() {
    const rId = document.getElementById('remote-id').value.trim();
    if (!rId) return alert("相手のIDを入れてね");
    
    conn = peer.connect(rId);
    conn.on('open', () => {
        startBattle();
    });
}

// 4. 対戦画面へ切り替え
function startBattle() {
    document.getElementById('setup-area').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';

    // データ受信時の処理
    conn.on('data', (data) => {
        enemyHand = data;
        checkResult();
    });
}

// 5. 手を送信
function sendHand(hand) {
    if (myHand) return; // 送信済みなら無視
    myHand = hand;
    conn.send(hand);
    document.getElementById('status').innerText = `あなたは ${hand} を出しました。\n相手の選択を待っています...`;
    checkResult();
}

// 6. 判定
function checkResult() {
    if (myHand && enemyHand) {
        let resText = "";
        if (myHand === enemyHand) {
            resText = "あいこ！ 🤝";
        } else if (
            (myHand === "✊" && enemyHand === "✌️") ||
            (myHand === "✌️" && enemyHand === "🖐️") ||
            (myHand === "🖐️" && enemyHand === "✊")
        ) {
            resText = "あなたの勝ち！ 🏆";
        } else {
            resText = "あなたの負け... 😭";
        }
        
        document.getElementById('status').innerText = "結果発表！";
        document.getElementById('result').innerHTML = `
            <div style="font-size:3rem; margin:10px 0;">${myHand} vs ${enemyHand}</div>
            <h2 style="color: #d32f2f;">${resText}</h2>
        `;
    }
}

init();
