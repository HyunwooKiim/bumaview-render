# API 명세서 - 응프 is CRAZY

## Base URL
```
https://bumaview-dev-ehi4ktpzza-du.a.run.app
```

## 인증
- Authorization: Bearer <Token>
- 로그인 후 받은 토큰을 Header에 포함하여 요청

---

## 1. Authentication (인증)

### 1.1 로그인
- **Endpoint**: `/api/auth/login`
- **Method**: `POST`
- **Role**: `ANONYMOUS`
- **Description**: 사용자 로그인

#### Request
```json
{
    "username": "username",
    "password": "password"
}
```

#### Response (200)
```json
Authorization: Bearer <Token>
```

---

## 2. User Management (사용자 관리)

### 2.1 사용자 생성
- **Endpoint**: `/api/users`
- **Method**: `POST`
- **Role**: `ANONYMOUS`
- **Description**: 새로운 사용자 계정 생성

#### Request
```json
{
    "username": "string",
    "password": "password",
    "role": "ADMIN" or "USER"
}
```

#### Response (200)
```json
{
    "user_id": int
}
```

### 2.2 비밀번호 변경
- **Endpoint**: `/api/users`
- **Method**: `PATCH`
- **Role**: `USER`
- **Description**: 사용자 비밀번호 업데이트

#### Request
```json
{
    "current_password": "string",
    "new_password": "string"
}
```

#### Response (200)
```json
{
    "message": "Password updated successfully"
}
```

### 2.3 사용자 삭제
- **Endpoint**: `/api/users`
- **Method**: `DELETE`
- **Role**: `USER`
- **Description**: 사용자 계정 삭제

#### Request
```json
{
    "user_id": int
}
```

#### Response (200)
```json
{
    "message": "User deleted successfully"
}
```

---

## 3. Question Management (질문 관리)

### 3.1 질문 생성
- **Endpoint**: `/api/questions`
- **Method**: `POST`
- **Role**: `USER`
- **Description**: 새로운 질문 생성

#### Request
```json
{
    "content": "string",
    "category": "string",
    "company": "company",
    "question_at": int
}
```

#### Response (200)
```json
{
    "question_id": int
}
```

### 3.2 모든 질문 조회
- **Endpoint**: `/api/questions`
- **Method**: `GET`
- **Role**: `ANONYMOUS`
- **Description**: 모든 질문 목록 조회

#### Response (200)
```json
[
    {
        "question_id": int,
        "user_id": int,
        "content": "string",
        "category": "string",
        "company": "string",
        "question_at": int,
        "score": int,
        "ai_comment": "string",
        "evaluated_at": "string",
        "answers": [
            {
                "user_id": int,
                "likes": int,
                "liked": bool,
                "content": "string",
                "answered_at": "string",
                "ai_comment": "string",
                "score": int,
                "user_comments": [
                    {
                        "user_id": int,
                        "content": "string",
                        "commented_at": "string"
                    }
                ]
            }
        ]
    }
]
```

### 3.3 필터링된 질문 조회
- **Endpoint**: `/api/questions/filtered?content=&category=&company=&question_at=&madeby=&`
- **Method**: `GET`
- **Role**: `ANONYMOUS`
- **Description**: 조건에 따라 필터링된 질문 조회 (관리자 생성만 볼 수 있게 필터)

#### Query Parameters
- `content`: 질문 내용 (optional)
- `category`: 카테고리 (optional)
- `company`: 회사명 (optional)
- `question_at`: 질문 시점 (optional)
- `madeby`: 작성자 (optional)

#### Response (200)
```json
[
    {
        "question_id": int,
        "user_id": int,
        "content": "string",
        "category": "string",
        "company": "string",
        "question_at": int,
        "score": int,
        "ai_comment": "string",
        "evaluated_at": "string"
    }
]
```

### 3.4 AI로 질문 생성
- **Endpoint**: `/api/questions/ai`
- **Method**: `POST`
- **Role**: `USER`
- **Description**: AI를 활용한 질문 자동 생성

#### Request
```json
{
    "topic": "string",
    "difficulty": "string",
    "count": int
}
```

#### Response (200)
```json
{
    "questions": [
        {
            "question_id": int,
            "content": "string"
        }
    ]
}
```

### 3.5 CSV로 질문 일괄 생성
- **Endpoint**: `/api/questions/csv`
- **Method**: `POST`
- **Role**: `USER`
- **Description**: CSV 파일을 통한 질문 일괄 등록

#### Request
```json
{
    "csv_file": "base64_encoded_csv_data"
}
```

#### Response (200)
```json
{
    "created_count": int,
    "failed_count": int,
    "question_ids": [int]
}
```

### 3.6 질문 삭제
- **Endpoint**: `/api/questions`
- **Method**: `DELETE`
- **Role**: `USER`
- **Description**: 특정 질문 삭제

#### Request
```json
{
    "question_id": int
}
```

#### Response (200)
```json
{
    "message": "Question deleted successfully"
}
```

---

## 4. Answer Management (답변 관리)

### 4.1 답변 생성
- **Endpoint**: `/api/answers`
- **Method**: `POST`
- **Role**: `USER`
- **Description**: 질문에 대한 답변 작성

#### Request
```json
{
    "question_at": int,
    "content": "string"
}
```

#### Response (200)
```json
{
    "answer_id": int
}
```

### 4.2 사용자별 답변 조회
- **Endpoint**: `/api/answers/my`
- **Method**: `GET`
- **Role**: `USER`
- **Description**: 로그인한 사용자의 답변 목록 조회

#### Response (200)
```json
[
    {
        "answer_id": int,
        "question_id": int,
        "content": "string",
        "answered_at": "string",
        "score": int,
        "ai_comment": "string",
        "likes": int
    }
]
```

### 4.3 답변 삭제
- **Endpoint**: `/api/answers`
- **Method**: `DELETE`
- **Role**: `USER`
- **Description**: 특정 답변 삭제

#### Request
```json
{
    "answer_id": int
}
```

#### Response (200)
```json
{
    "message": "Answer deleted successfully"
}
```

### 4.4 답변 좋아요
- **Endpoint**: `/api/answers/like`
- **Method**: `POST`
- **Role**: `USER`
- **Description**: 답변에 좋아요 추가

#### Request
```json
{
    "answer_id": int
}
```

#### Response (200)
```json
{
    "message": "Like added successfully",
    "likes_count": int
}
```

### 4.5 답변 좋아요 취소
- **Endpoint**: `/api/answers/unlike`
- **Method**: `DELETE`
- **Role**: `USER`
- **Description**: 답변 좋아요 취소

#### Request
```json
{
    "answer_id": int
}
```

#### Response (200)
```json
{
    "message": "Like removed successfully",
    "likes_count": int
}
```

### 4.6 답변 댓글 좋아요
- **Endpoint**: `/api/answers/comment/like`
- **Method**: `POST`
- **Role**: `USER`
- **Description**: 답변 댓글에 좋아요 추가

#### Request
```json
{
    "comment_id": int
}
```

#### Response (200)
```json
{
    "message": "Comment like added successfully"
}
```

### 4.7 답변 댓글 좋아요 취소
- **Endpoint**: `/api/answers/comment/unlike`
- **Method**: `DELETE`
- **Role**: `USER`
- **Description**: 답변 댓글 좋아요 취소

#### Request
```json
{
    "comment_id": int
}
```

#### Response (200)
```json
{
    "message": "Comment like removed successfully"
}
```

---

## 5. Review Management (리뷰 관리)

### 5.1 리뷰 생성
- **Endpoint**: `/api/reviews`
- **Method**: `POST`
- **Role**: `USER`
- **Description**: 면접 리뷰 작성

#### Request
```json
{
    "title": "string",
    "content": "string",
    "company": "string",
    "category": "string",
    "rating": int
}
```

#### Response (200)
```json
{
    "review_id": int
}
```

### 5.2 모든 리뷰 조회
- **Endpoint**: `/api/reviews`
- **Method**: `GET`
- **Role**: `ANONYMOUS`
- **Description**: 모든 리뷰 목록 조회

#### Response (200)
```json
[
    {
        "review_id": int,
        "user_id": int,
        "title": "string",
        "content": "string",
        "company": "string",
        "category": "string",
        "rating": int,
        "created_at": "string"
    }
]
```

### 5.3 필터링된 리뷰 조회
- **Endpoint**: `/api/reviews/filtered?category=&company=`
- **Method**: `GET`
- **Role**: `ANONYMOUS`
- **Description**: 조건에 따라 필터링된 리뷰 조회 (관리자 생성만 볼 수 있게 필터)

#### Query Parameters
- `category`: 카테고리 (optional)
- `company`: 회사명 (optional)

#### Response (200)
```json
[
    {
        "review_id": int,
        "user_id": int,
        "title": "string",
        "content": "string",
        "company": "string",
        "category": "string",
        "rating": int,
        "created_at": "string"
    }
]
```

### 5.4 리뷰 댓글 생성
- **Endpoint**: `/api/reviews/comment`
- **Method**: `POST`
- **Role**: `USER`
- **Description**: 리뷰에 댓글 작성

#### Request
```json
{
    "review_id": int,
    "content": "string"
}
```

#### Response (200)
```json
{
    "comment_id": int
}
```

### 5.5 리뷰 댓글 수정
- **Endpoint**: `/api/reviews/comment`
- **Method**: `PATCH`
- **Role**: `USER`
- **Description**: 리뷰 댓글 수정

#### Request
```json
{
    "comment_id": int,
    "content": "string"
}
```

#### Response (200)
```json
{
    "message": "Comment updated successfully"
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - 요청 성공 |
| 201  | Created - 리소스 생성 성공 |
| 400  | Bad Request - 잘못된 요청 |
| 401  | Unauthorized - 인증 실패 |
| 403  | Forbidden - 권한 없음 |
| 404  | Not Found - 리소스를 찾을 수 없음 |
| 500  | Internal Server Error - 서버 오류 |

## Error Response Format

```json
{
    "error": {
        "code": "ERROR_CODE",
        "message": "Error description",
        "details": "Additional error details"
    }
}
```

## 역할별 권한

| 역할 | 설명 |
|------|------|
| ANONYMOUS | 로그인하지 않은 사용자 - 읽기 권한만 |
| USER | 로그인한 일반 사용자 - 읽기/쓰기 권한 |
| ADMIN | 관리자 - 모든 권한 |

---

*본 API 명세서는 "응프 is CRAZY" 프로젝트의 백엔드 API를 문서화한 것입니다.*