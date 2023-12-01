import React from "react";

type directions = "up" | "down" | "left" | "right";
type color =
  | "darkgrey"
  | "grey"
  | "lightslategray"
  | "cadetblue"
  | "cornflowerblue"
  | "darkcyan"
  | "blue"
  | "darkslateblue"
  | "slateblue"
  | "blueviolet"
  | "purple";

export const GameBoard2042 = () => {
  const [board, setBoard] = React.useState<number[][]>([]);
  const [score, setScore] = React.useState<number>(0);
  const [gameOver, setGameOver] = React.useState<boolean>(false);

  const previousKey = React.useRef<string>();

  const getColor = (v: number): color => {
    switch (v) {
      case 0:
      case 2:
        return "darkgrey";
      case 4:
        return "grey";
      case 8:
        return "lightslategray";
      case 16:
        return "cadetblue";
      case 32:
        return "cornflowerblue";
      case 64:
        return "darkcyan";
      case 128:
        return "blue";
      case 256:
        return "darkslateblue";
      case 512:
        return "slateblue";
      case 1024:
        return "blueviolet";
      case 2048:
      default:
        return "purple";
    }
  };

  /*
   *  Check if any value is equal to or greater than the number passed in
   */
  const checkForNumber = (num: number): boolean => {
    let exists = false;

    board.forEach((row) => {
      row.forEach((val) => {
        if (val >= num) {
          exists = true;
        }
      });
    });
    return exists;
  };

  /*
   *  Takes in an array and shifts all values to the left, depending on whether the cell contains a 0.
   *  Returns updated array after shifting.
   */
  const shift = (list: number[]): number[] => {
    const tempArray = [...list];

    tempArray.forEach((v, vIndex) => {
      if (v > 0 || vIndex === list.length) {
        tempArray[vIndex] = v;
      } else {
        const greaterIndex = tempArray.findIndex(
          (val, valIndex) => valIndex > vIndex && val > 0
        );
        if (greaterIndex !== -1) {
          tempArray[vIndex] = tempArray[greaterIndex];
          tempArray[greaterIndex] = 0;
        } else {
          tempArray[vIndex] = v;
        }
      }
    });

    return tempArray;
  };

  /*
   *  Takes in an array and if a value and the value to the right of it are the same number:
   *  - Add them together and replace the first value
   *  - Replace the second value with a 0
   *  Returns array after merging
   */
  const merge = (list: number[], checking: boolean): number[] => {
    const tempArray = [...list];

    tempArray.forEach((v, vIndex) => {
      if (vIndex < list.length && v === list[vIndex + 1]) {
        tempArray[vIndex] = v + v;
        tempArray[vIndex + 1] = 0;
        if (!checking) {
          setScore((prev) => prev + v + v);
        }
      } else {
        tempArray[vIndex] = v;
      }
    });

    return tempArray;
  };

  const generateRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  /*
   *  If there are any empty cells left, add a 2 or 4 to one of them at random. Otherwise, check if anymore moves can be made, if not game over.
   *  Min and max are used to determine the size of the 2d array. These are hard coded values for now.
   *  Returns an updated game board if there was an empty cell or if the board can be shifted/merged still.
   */
  const generateRandom = (
    min: number,
    max: number,
    currentBoard: number[][]
  ): number[][] => {
    let emptyCell = false;

    currentBoard.forEach((r) => {
      r.forEach((cell) => {
        if (cell === 0) {
          emptyCell = true;
        }
      });
    });

    if (!emptyCell && gameOverCheck(currentBoard)) {
      setGameOver(true);
      return currentBoard;
    } else if (emptyCell) {
      const rowNum = generateRandomNumber(min, max);
      const columnNum = generateRandomNumber(min, max);

      if (currentBoard && currentBoard[rowNum][columnNum] !== 0) {
        return generateRandom(min, max, currentBoard);
      } else {
        const newBoard = currentBoard?.map((r, rIndex) => {
          return r.map((c, cIndex) => {
            if (rIndex === rowNum && cIndex === columnNum) {
              const randomNumber: number = generateRandomNumber(0, 2);
              if (randomNumber <= 1 || !checkForNumber(4)) {
                return 2;
              }
              return 4;
            } else {
              return c;
            }
          });
        });
        return newBoard;
      }
    } else {
      return currentBoard;
    }
  };

  /*
   *  Called from button press and for checking if game over. Passes each array of the 2d game board to the functions that adjust them.
   *  Left - Just call the functions, everything already shifts and merges from left
   *  Right - Just flip each array before shifting/merging and then flip them back
   *  Up - Rotate the entire board -90 degrees, shift and merge, then rotate back
   *  Down - Rotate the entire board 90 degrees, shift and merge, then rotate back
   *  Returns the updated board
   */
  const action = (
    direction: directions,
    currentBoard: number[][],
    checking: boolean
  ): number[][] => {
    const clonedBoard: number[][] = JSON.parse(JSON.stringify(currentBoard));

    switch (direction) {
      case "up": {
        const rotatedBoard: number[][] = [[], [], [], []];
        const unRotatedBoard: number[][] = [[], [], [], []];

        clonedBoard.forEach((row) => {
          row.forEach((cell, cIndex) => rotatedBoard[cIndex].push(cell));
        });

        const shifted = rotatedBoard.map((r) => {
          const shifted = shift(r);
          const merged = merge(shifted, checking);
          return shift(merged);
        });

        shifted.forEach((row) => {
          row.forEach((cell, cIndex) => unRotatedBoard[cIndex].push(cell));
        });

        return unRotatedBoard;
      }
      case "down": {
        const rotatedBoard: number[][] = [[], [], [], []];
        const unRotatedBoard: number[][] = [[], [], [], []];

        clonedBoard.forEach((row) => {
          row.forEach((cell, cIndex) => rotatedBoard[cIndex].push(cell));
        });

        const shifted = rotatedBoard.map((r) => {
          const shifted = shift(r.reverse());
          const merged = merge(shifted, checking);
          return shift(merged);
        });

        shifted.forEach((row) => {
          const rotatedRow = row.reverse();
          rotatedRow.forEach((cell, cIndex) =>
            unRotatedBoard[cIndex].push(cell)
          );
        });

        return unRotatedBoard;
      }
      case "right": {
        const flippedBoard: number[][] = [];

        clonedBoard.forEach((r) => {
          const shifted = shift(r.reverse());
          const merged = merge(shifted, checking);
          const final = shift(merged);
          flippedBoard.push(final);
        });

        const newBoard = flippedBoard.map((r) => {
          return r.reverse();
        });

        return newBoard;
      }
      case "left":
      default: {
        const newBoard: number[][] = [];

        clonedBoard.forEach((r) => {
          const shifted = shift(r);
          const merged = merge(shifted, checking);
          const final = shift(merged);
          newBoard.push(final);
        });

        return newBoard;
      }
    }
  };

  /*
   *  Start with an empty 2d array and add two random numbers to it, then set the game board.
   */
  const createBoard = async () => {
    const newBoard = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const firstNew = generateRandom(0, 3, newBoard);
    const secondNew = generateRandom(0, 3, firstNew);
    setBoard(secondNew);
  };

  /*
   *  Called if there are no more empty cells and a move is made. Checks for possible moves. Returns whether or not any moves can be made.
   */
  const gameOverCheck = (currentBoard: number[][]): boolean => {
    let canMergeRight = false;
    let canMergeLeft = false;
    let canMergeUp = false;
    let canMergeDown = false;

    const actionUp = action("up", currentBoard, true);
    const actionDown = action("down", currentBoard, true);
    const actionRight = action("right", currentBoard, true);
    const actionLeft = action("left", currentBoard, true);

    actionRight?.forEach((r, index) => {
      const boardRow = currentBoard[index];
      if (JSON.stringify(r) !== JSON.stringify(boardRow)) {
        canMergeRight = true;
      }
    });
    actionLeft?.forEach((r, index) => {
      const boardRow = currentBoard[index];
      if (JSON.stringify(boardRow) !== JSON.stringify(r)) {
        canMergeLeft = true;
      }
    });
    actionUp?.forEach((r, index) => {
      const boardRow = currentBoard[index];
      if (JSON.stringify(r) !== JSON.stringify(boardRow)) {
        canMergeUp = true;
      }
    });
    actionDown?.forEach((r, index) => {
      const boardRow = currentBoard[index];
      if (JSON.stringify(r) !== JSON.stringify(boardRow)) {
        canMergeDown = true;
      }
    });

    if (canMergeRight || canMergeLeft || canMergeDown || canMergeUp) {
      return false;
    }

    return true;
  };

  /*
   *  UseEffect listens for button presses and if wasd or directions, will call necessary functions to move numbers in that direction
   */
  React.useEffect(() => {
    const onButtonPress = (e: KeyboardEvent) => {
      if (e.repeat || gameOver) return;

      if (
        (e.key === "w" || e.key === "ArrowUp") &&
        previousKey.current !== "w" &&
        previousKey.current !== "ArrowUp"
      ) {
        const newBoard = action("up", board, false) || [];
        const boardWithNewNumber = generateRandom(0, 3, newBoard) || [];
        setBoard(boardWithNewNumber);
      }
      if (
        (e.key === "s" || e.key === "ArrowDown") &&
        previousKey.current !== "s" &&
        previousKey.current !== "ArrowDown"
      ) {
        const newBoard = action("down", board, false) || [];
        const boardWithNewNumber = generateRandom(0, 3, newBoard) || [];
        setBoard(boardWithNewNumber);
      }
      if (
        (e.key === "d" || e.key === "ArrowRight") &&
        previousKey.current !== "d" &&
        previousKey.current !== "ArrowRight"
      ) {
        const newBoard = action("right", board, false) || [];
        const boardWithNewNumber = generateRandom(0, 3, newBoard) || [];
        setBoard(boardWithNewNumber);
      }
      if (
        (e.key === "a" || e.key === "ArrowLeft") &&
        previousKey.current !== "a" &&
        previousKey.current !== "ArrowLeft"
      ) {
        const newBoard = action("left", board, false) || [];
        const boardWithNewNumber = generateRandom(0, 3, newBoard) || [];
        setBoard(boardWithNewNumber);
      }

      previousKey.current = e.key;
    };

    window.addEventListener("keydown", onButtonPress);
    window.addEventListener("keyup", () => {
      previousKey.current = undefined;
    });

    return () => {
      window.removeEventListener("keydown", onButtonPress);
    };
  }, [board]);

  /*
   *  UseEffect is called on start to initially setup the board
   */
  React.useEffect(() => {
    if (board.length === 0) {
      createBoard();
    }
  }, []);

  /*
   *  Starts a new game on button press
   */
  const restartGame = () => {
    createBoard();
    setScore(0);
    setGameOver(false);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <label style={{ fontSize: 24, fontWeight: 700 }}>2048</label>
        <div>
          <label style={{ fontSize: 14, fontWeight: 700 }}>
            Score: {score}
          </label>
        </div>
      </div>

      {board.length > 0 ? (
        <div
          style={{
            height: 230,
            width: 228,
            display: "grid",
            justifyContent: "center",
            alignItems: "center",
            background: "lightgrey",
            position: "relative",
          }}
        >
          {gameOver && (
            <div
              style={{
                position: "absolute",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                height: "100%",
                width: "100%",
                background: "rgba(47, 79, 79, 0.8)",
              }}
            >
              <label style={{ fontWeight: 800, fontSize: 20 }}>
                {checkForNumber(2048) ? "You Win!" : "Game Over"}
              </label>
              <button
                onClick={restartGame}
                style={{
                  width: "fit-content",
                  fontSize: 12,
                  background: "black",
                }}
              >
                New game
              </button>
            </div>
          )}

          {board.map((r, rIndex) => {
            return (
              <div
                key={"Row-" + rIndex}
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 3,
                  marginBottom: 3,
                }}
              >
                {r.map((c, cIndex) => {
                  return (
                    <div
                      key={"Cell-" + cIndex}
                      style={{
                        width: 50,
                        height: 50,
                        background: getColor(c),
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <label style={{ fontSize: 18, fontWeight: 700 }}>
                        {c > 0 ? c : ""}
                      </label>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
