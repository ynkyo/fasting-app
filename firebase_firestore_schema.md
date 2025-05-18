# Firestore ドキュメント構造・設計（2024年版）

## users（コレクション）

| フィールド名   | 型         | 説明                |
|--------------|------------|---------------------|
| userName     | string     | ユーザー名          |
| createdAt    | timestamp  | 登録日時            |
| ...          | ...        | その他プロフィール情報 |

### └ mitotchiState（サブコレクション）

| フィールド名         | 型            | 説明                        |
|----------------------|---------------|-----------------------------|
| level                | number        | ミトっちのレベル             |
| experience           | number        | ミトっちの経験値             |
| decorations          | array<string> | 所持装飾アイテムIDリスト     |
| unlockedBuddies      | array<string> | 解除済み仲間キャラIDリスト   |
| currentDecoration    | string        | 現在装備中の装飾ID           |

### └ purchases（サブコレクション）

| フィールド名   | 型         | 説明                        |
|--------------|------------|-----------------------------|
| itemId       | string     | 購入アイテムID（skins参照）  |
| itemType     | string     | 種別（"skin"等）            |
| purchasedAt  | timestamp  | 購入日時                    |

### └ friends（サブコレクション）

| フィールド名   | 型         | 説明                |
|--------------|------------|---------------------|
| friendId     | string     | フレンドのユーザーID |
| createdAt    | timestamp  | フレンド追加日時     |

### └ friendRequests（サブコレクション）

| フィールド名   | 型         | 説明                        |
|--------------|------------|-----------------------------|
| fromUserId   | string     | 申請送信者のUID              |
| status       | string     | 申請状態（"pending"等）      |

---

## skins（コレクション）

| フィールド名   | 型         | 説明                        |
|--------------|------------|-----------------------------|
| name         | string     | スキン名                    |
| price        | number     | 価格                        |
| assetPath    | string     | 画像/アセットのStorageパス   |

---

## buddies（コレクション）

| フィールド名   | 型         | 説明                        |
|--------------|------------|-----------------------------|
| name         | string     | 仲間キャラ名                 |
| assetPath    | string     | 画像/アニメーションパス      |

---

## animations（コレクション）

| フィールド名   | 型         | 説明                        |
|--------------|------------|-----------------------------|
| name         | string     | アニメーション名             |
| assetPath    | string     | アニメーションJSONのパス     |

---

## 構造イメージ（ツリー）

```
users (コレクション)
 └ {userId} (ドキュメント)
     ├─ userName, createdAt, ...
     ├─ mitotchiState (サブコレクション)
     │    └ {stateId} (level, experience, decorations, ...)
     ├─ purchases (サブコレクション)
     │    └ {purchaseId} (itemId, itemType, purchasedAt)
     ├─ friends (サブコレクション)
     │    └ {friendId} (friendId, createdAt)
     └─ friendRequests (サブコレクション)
          └ {requestId} (fromUserId, status)

skins (コレクション)
 └ {skinId} (name, price, assetPath)

buddies (コレクション)
 └ {buddyId} (name, assetPath)

animations (コレクション)
 └ {animId} (name, assetPath)
``` 