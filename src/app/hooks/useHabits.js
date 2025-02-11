import { useState, useEffect } from 'react'
import { addHabitToDB, getHabitsFromDB } from '../utils/api'

export const useHabits = () => {
  const [habits, setHabits] = useState([])
  const [habit, setHabit] = useState('')

  useEffect(() => {
    const fetchHabits = async () => {
      const data = await getHabitsFromDB()
      setHabits(data)
    }
    fetchHabits()
  }, [])

  const addHabit = async () => {
    if (habit) {
      await addHabitToDB(habit)
      setHabits([...habits, habit])
      setHabit('')
    }
  }

  return { habits, habit, setHabit, addHabit }
}
