import Head from "next/head";
import React, { useState } from "react";
import slugify from "slugify";
import CategoryForm from "../components/CategoryForm";
import { IItem } from "../types";
import {
  EMPTY_BOARD,
  makeid,
  toChunks,
  validateIsEnglish,
  generateBoardUrl,
} from "../utils";

const ID = makeid(4);

function useCreateBoard() {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [username, setUsername] = useState("");

  const onItemBlur = (value: string, index: number) => {
    const nextItems = board.items.map((item, i) => {
      const nextValue = i === index ? value : item.text;
      return { ...item, text: nextValue };
    });

    setBoard({
      ...board,
      items: nextItems,
    });
  };

  const onAnswersBlur = (value: string[], categoryId: string) => {
    setBoard({
      ...board,
      answers: {
        ...board.answers,
        [categoryId]: value,
      },
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/create", {
        method: "POST",
        body: JSON.stringify({
          board: { id: slugify(`${username} ${ID}`), ...board },
        }),
      });
      const responseJson = await response.json();

      if (typeof window !== "undefined") {
        window.location.href = `${boardUrl}?toast=new`;
      }
    } catch {}
  };

  const boardUrl = generateBoardUrl(username, ID);
  const categories = toChunks<IItem>(board.items, 4);

  return {
    board,
    username,
    boardUrl,
    categories,
    setUsername,
    onItemBlur,
    onAnswersBlur,
    onSubmit,
  };
}

export default function Create() {
  const {
    username,
    setUsername,
    onAnswersBlur,
    onItemBlur,
    onSubmit,
    boardUrl,
    categories,
  } = useCreateBoard();

  return (
    <div>
      <main style={{ padding: 40 }}>
        <h1>יצירת לוח</h1>

        <form onSubmit={onSubmit}>
          {/* <h2>כמה פרטים עליך</h2> */}

          {/* <fieldset>
            <label>
              שם
              <input placeholder="שם (פרטי, מלא, בדוי..)" />
            </label>
          </fieldset> */}

          <fieldset>
            <label>
              שם משתמש (אנגלית בלבד)
              <input
                placeholder="שם משתמש (אנגלית בלבד)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={validateIsEnglish}
                required
              />
            </label>
          </fieldset>

          {username && (
            <div className="board-url-notice">
              בסיום היצירה הלוח שלך יהיה זמין בכתובת:
              <a href={boardUrl}>{boardUrl}</a>
            </div>
          )}

          {categories.map((categoryItems, index) => (
            <CategoryForm
              key={index}
              index={index}
              items={categoryItems}
              categoryIndex={index}
              onItemBlur={onItemBlur}
              onAnswersBlur={onAnswersBlur}
            />
          ))}

          <button type="submit">סיימתי</button>
        </form>
      </main>
    </div>
  );
}
