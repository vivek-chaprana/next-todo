import { AiOutlinePlus } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import { GoSignOut } from "react-icons/go";

import { useAuth } from "@/firebase/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Loader from "@/components/Loader";

import {
  collection,
  addDoc,
  getDocs,
  where,
  query,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";

export default function Home() {
  const { authUser, isLoading, signOut } = useAuth();

  const [todoInput, setTodoInput] = useState("");
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);

  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push("/login");
    }

    if (!!authUser) {
      fetchTodo(authUser.uid);
    }
  }, [authUser, isLoading]);
  const addTodo = async () => {
    if (todoInput === "") return;
    try {
      const docRef = await addDoc(collection(db, "todos"), {
        owner: authUser.uid,
        content: todoInput,
        completed: false,
        timeStamp: serverTimestamp(),
      });
      fetchTodo(authUser.uid);
      setTodoInput("");
    } catch (error) {
      console.error("An error occured ", error);
    }
  };

  const deleteTodo = async (docId) => {
    try {
      await deleteDoc(doc(db, "todos", docId));
      fetchTodo(authUser.uid);
    } catch (error) {
      console.error("An error occured ", error);
    }
  };

  const markAsCompleteHandler = async (event, docId) => {
    try {
      const docRef = doc(db, "todos", docId);
      await updateDoc(docRef, {
        completed: event.target.checked,
      });
      fetchTodo(authUser.uid);
    } catch (error) {
      console.error("An error occured ", error);
    }
  };

  const fetchTodo = async (uid) => {
    try {
      const q = query(
        collection(db, "todos"),
        where("owner", "==", uid),
        orderBy("timeStamp")
      );
      const querySnapshot = await getDocs(q);
      let tempTodos = [];
      let tempCompletedTodos = [];
      querySnapshot.forEach((doc) => {
        const todo = { ...doc.data(), id: doc.id };
        if (todo.completed) tempCompletedTodos.push(todo);
        else tempTodos.push(todo);
      });
      setTodos(tempTodos);
      setCompletedTodos(tempCompletedTodos);
    } catch (error) {
      console.error("An error occured ", error);
    }
  };

  const onKeyUp = (e) => {
    if (e.key === "Enter" && todoInput.length > 0) addTodo();
  };

  const TodoDiv = ({ todo }) => {
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <input
            onChange={(e) => markAsCompleteHandler(e, todo.id)}
            checked={todo.completed}
            id={`todo-${todo.id}`}
            type="checkbox"
            className="w-4 h-4 accent-green-400 rounded-lg"
          />
          <label
            htmlFor={`todo-${todo.id}`}
            className={`font-medium ${todo.completed ? "line-through" : ""}`}
          >
            {todo.content}
          </label>
        </div>

        <div className="flex items-center gap-3">
          <MdDeleteForever
            onClick={() => deleteTodo(todo.id)}
            size={24}
            className="text-red-400 hover:text-red-600 cursor-pointer"
          />
        </div>
      </div>
    );
  };

  return !authUser ? (
    <Loader />
  ) : (
    <main className="">
      <div
        onClick={signOut}
        className="bg-black text-white w-44 py-4 mt-10 rounded-lg transition-transform hover:bg-black/[0.8] active:scale-90 flex items-center justify-center gap-2 font-medium shadow-md fixed bottom-5 right-5 cursor-pointer"
      >
        <GoSignOut size={18} />
        <span>Logout</span>
      </div>
      <div className="max-w-3xl mx-auto mt-10 p-8">
        <div className="bg-white -m-6 p-3 sticky top-0">
          <div className="flex justify-center flex-col items-center">
            <span className="text-7xl mb-10">📝</span>
            <h1 className="text-5xl md:text-7xl font-bold">TooDoo&apos;s</h1>
          </div>
          <div className="flex items-center gap-2 mt-10">
            <input
              onKeyUp={onKeyUp}
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              placeholder={`👋 Hello ${authUser.username}, What to do Today?`}
              type="text"
              className="font-semibold placeholder:text-gray-500 border-[2px] border-black h-[60px] grow shadow-sm rounded-md px-4 focus-visible:outline-yellow-400 text-lg transition-all duration-300"
              autoFocus
            />
            <button
              onClick={addTodo}
              className="w-[60px] h-[60px] rounded-md bg-black flex justify-center items-center cursor-pointer transition-all duration-300 hover:bg-black/[0.8]"
            >
              <AiOutlinePlus size={30} color="#fff" />
            </button>
          </div>
        </div>
        <div className="my-10">
          {todos.length > 0 &&
            todos.map((todo) => <TodoDiv key={todo.id} todo={todo} />)}
          {completedTodos.length > 0 &&
            completedTodos.map((todo) => <TodoDiv key={todo.id} todo={todo} />)}
        </div>
      </div>
    </main>
  );
}
