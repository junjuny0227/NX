import styled from "styled-components";
import { useState } from "react";
import { auth } from "../firebase";
import { updateProfile } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const Wrapper = styled.div`
  background-color: rgba(91, 112, 131, 0.4);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
`;

const Container = styled.div`
  background-color: black;
  width: 37.5rem;
  height: 8.2rem;
  border-radius: 16px;
  padding: 16px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: end;
`;

const SvgIcon = styled.svg`
  position: absolute;
  top: 10px;
  left: 10px;
  box-sizing: content-box;
  padding: 6px;
  fill: currentColor;
  width: 1.6rem;
  height: 1.6rem;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
`;

const Label = styled.label`
  width: 100%;
`;

const Form = styled.form<{ $focused: boolean }>`
  width: 100%;
  height: 60px;
  border: 1px solid
    ${(props) => (props.$focused ? "#1d9bf0" : "rgb(51, 54, 57)")};
  border-radius: 4px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Text = styled.span<{ $focused: boolean }>`
  color: ${(props) => (props.$focused ? "#1d9bf0" : "#71767b")};
  font-size: 13px;
  font-weight: 400;
  line-height: 13px;
`;

const Input = styled.input`
  width: 100%;
  outline: none;
  background-color: black;
  border: none;
  color: white;
  font-size: 17px;

  &:focus {
    border-color: #1d9bf0;
  }
`;

interface ChangeNameProps {
  closeModal: () => void;
}

export default function ChangeName({ closeModal }: ChangeNameProps) {
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.currentTarget.value);
  };

  const updateTweetsUsername = async (oldName: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const tweetsRef = collection(db, "tweets");
    const q = query(tweetsRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No matching documents.");
      return;
    }

    console.log("Updating tweets from", oldName, "to", newName); // oldName 사용 예시

    const updates = querySnapshot.docs.map((doc) => {
      return updateDoc(doc.ref, { username: newName });
    });

    await Promise.all(updates);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) return;
      const oldName = user.displayName || ""; // 이전 이름 저장
      await updateProfile(user, {
        displayName: newName,
      });
      await updateTweetsUsername(oldName); // 트윗의 사용자 이름 업데이트
      setNewName("");
      closeModal();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Container>
        {loading && <span>Loading...</span>} {/* 로딩 중 상태 표시 */}
        <SvgIcon
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          onClick={closeModal}
        >
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </SvgIcon>
        <Label htmlFor="nameInput">
          <Form $focused={focused} onSubmit={onSubmit}>
            <Text $focused={focused}>Name</Text>
            <Input
              id="nameInput"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={onChange}
              name="name"
              value={newName}
              type="text"
              required
            />
          </Form>
        </Label>
      </Container>
    </Wrapper>
  );
}
