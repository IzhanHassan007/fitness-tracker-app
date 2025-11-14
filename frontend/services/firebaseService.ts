// d:\01_Aykays Projects\05_Fitness Tracker App\frontend\services\firebaseService.ts
import { auth, db } from './firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fsLimit,
  Timestamp
} from 'firebase/firestore'

function uid() {
  const u = auth.currentUser?.uid
  if (!u) throw new Error('Not authenticated')
  return u
}

function iso(value: any) {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  return value
}

function serialize(obj: any) {
  const out: any = {}
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v && typeof v === 'object' && 'seconds' in (v as any) && 'nanoseconds' in (v as any)) {
      out[k] = iso(v)
    } else if (v && typeof v === 'object') {
      out[k] = serialize(v)
    } else {
      out[k] = v
    }
  })
  return out
}

function withId(d: any) {
  const data = serialize(d.data())
  return { _id: d.id, ...data }
}

async function getUserProfile(u: string) {
  const ref = doc(db, 'users', u)
  const snap = await getDoc(ref)
  return snap.exists() ? { _id: snap.id, ...serialize(snap.data()) } : null
}

export const authAPI = {
  async login(credentials: { email: string; password: string }) {
    if ((process.env.NEXT_PUBLIC_AUTH_DEV_MODE || '').trim() === 'true') {
      const id = `dev_${Date.now()}`
      const token = `dev-token-${id}`
      const user = {
        _id: id,
        name: credentials.email.split('@')[0] || 'User',
        email: credentials.email,
        avatar: '',
        isEmailVerified: false,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return { success: true, message: 'Login successful (dev mode)', token, user }
    }
    try {
      const res = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)
      const token = await res.user.getIdToken()
      let profile = await getUserProfile(res.user.uid)
      if (!profile) {
        const p = {
          name: res.user.displayName || '',
          email: res.user.email || credentials.email,
          avatar: res.user.photoURL || '',
          isEmailVerified: !!res.user.emailVerified,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        await setDoc(doc(db, 'users', res.user.uid), p)
        profile = { _id: res.user.uid, ...p }
      }
      return { success: true, message: 'Login successful', token, user: profile }
    } catch (e: any) {
      const message = e?.message || 'Login failed'
      const code = e?.code
      return { success: false, message, code }
    }
  },
  async signup(userData: {
    name: string
    email: string
    password: string
    dateOfBirth?: string
    gender?: string
    height?: { value: number; unit: string }
    activityLevel?: string
    fitnessGoals?: string[]
  }) {
    if ((process.env.NEXT_PUBLIC_AUTH_DEV_MODE || '').trim() === 'true') {
      const id = `dev_${Date.now()}`
      const token = `dev-token-${id}`
      const profile = {
        name: userData.name,
        email: userData.email,
        avatar: '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: (userData.gender as any) || 'prefer-not-to-say',
        height: userData.height || { value: 0, unit: 'cm' },
        activityLevel: userData.activityLevel || 'moderate',
        fitnessGoals: userData.fitnessGoals || [],
        isEmailVerified: false,
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return { success: true, message: 'Signup successful (dev mode)', token, user: { _id: id, ...profile } }
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, userData.email, userData.password)
      const token = await res.user.getIdToken()
      const profile = {
        name: userData.name,
        email: userData.email,
        avatar: '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: (userData.gender as any) || 'prefer-not-to-say',
        height: userData.height || { value: 0, unit: 'cm' },
        activityLevel: userData.activityLevel || 'moderate',
        fitnessGoals: userData.fitnessGoals || [],
        isEmailVerified: false,
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      await setDoc(doc(db, 'users', res.user.uid), profile)
      return { success: true, message: 'Signup successful', token, user: { _id: res.user.uid, ...profile } }
    } catch (e: any) {
      const message = e?.message || 'Signup failed'
      const code = e?.code
      return { success: false, message, code }
    }
  },
  async getCurrentUser() {
    const u = auth.currentUser
    if (!u) return { success: false, message: 'No user', user: null }
    const profile = await getUserProfile(u.uid)
    return { success: true, user: profile }
  },
  async updateProfile(userData: any) {
    const u = uid()
    const ref = doc(db, 'users', u)
    await updateDoc(ref, { ...userData, updatedAt: new Date().toISOString() })
    const snap = await getDoc(ref)
    return { success: true, user: { _id: snap.id, ...serialize(snap.data()) } }
  },
  async changePassword(passwords: { currentPassword: string; newPassword: string }) {
    const u = auth.currentUser
    if (!u || !u.email) return { success: false, message: 'Not authenticated' }
    const cred = EmailAuthProvider.credential(u.email, passwords.currentPassword)
    await reauthenticateWithCredential(u, cred)
    await updatePassword(u, passwords.newPassword)
    return { success: true, message: 'Password changed' }
  }
}

export const usersAPI = {
  async getStats() {
    return { success: true, data: { total: 0 } }
  },
  async deleteAccount() {
    const u = uid()
    await deleteDoc(doc(db, 'users', u))
    await auth.currentUser?.delete()
    return { success: true, message: 'Account deleted' }
  }
}

export const nutritionAPI = {
  async getMeals(params: any = {}) {
    const u = uid()
    const q = query(collection(db, 'meals'), where('userId', '==', u), orderBy('mealTime', 'desc'), fsLimit(params.limit || 20))
    const snaps = await getDocs(q)
    const data = snaps.docs.map(withId)
    const pagination = { page: params.page || 1, limit: params.limit || 20, total: data.length, pages: 1 }
    return { data, pagination }
  },
  async getMeal(id: string) {
    const snap = await getDoc(doc(db, 'meals', id))
    if (!snap.exists()) throw new Error('Not found')
    return withId(snap)
  },
  async createMeal(mealData: any) {
    const u = uid()
    const payload = {
      ...mealData,
      userId: u,
      mealTime: mealData.mealTime || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const ref = await addDoc(collection(db, 'meals'), payload)
    const snap = await getDoc(ref)
    return withId(snap)
  },
  async updateMeal(id: string, data: any) {
    await updateDoc(doc(db, 'meals', id), { ...data, updatedAt: new Date().toISOString() })
    const snap = await getDoc(doc(db, 'meals', id))
    return withId(snap)
  },
  async deleteMeal(id: string) {
    await deleteDoc(doc(db, 'meals', id))
  },
  async getDailyNutrition(date: string) {
    const u = uid()
    const key = `${u}_${date}`
    const ref = doc(db, 'daily_nutrition', key)
    const snap = await getDoc(ref)
    if (snap.exists()) return withId(snap)
    const base = {
      userId: u,
      date,
      meals: [],
      waterIntake: { total: 0, unit: 'ml' },
      goals: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    await setDoc(ref, base)
    return { _id: key, ...base }
  },
  async updateDailyGoals(date: string, data: any) {
    const u = uid()
    const key = `${u}_${date}`
    const ref = doc(db, 'daily_nutrition', key)
    await setDoc(ref, { ...data, userId: u, date, updatedAt: new Date().toISOString() }, { merge: true })
    const snap = await getDoc(ref)
    return withId(snap)
  },
  async addWaterIntake(date: string, { amount, unit }: { amount: number; unit: string }) {
    const u = uid()
    const key = `${u}_${date}`
    const ref = doc(db, 'daily_nutrition', key)
    const snap = await getDoc(ref)
    const prev = snap.exists() ? snap.data() : { waterIntake: { total: 0, unit: unit } }
    const next = {
      waterIntake: { total: (prev.waterIntake?.total || 0) + amount, unit: unit || prev.waterIntake?.unit || 'ml' },
      updatedAt: new Date().toISOString()
    }
    await setDoc(ref, next, { merge: true })
    const updated = await getDoc(ref)
    const data = serialize(updated.data() || {})
    return data.waterIntake
  },
  async getStats(params: any = {}) {
    const res = await this.getMeals(params)
    const meals = res.data
    const totalMeals = meals.length
    const averageCalories = Math.round(meals.reduce((s: number, m: any) => s + (m.calories?.total || 0), 0) / Math.max(totalMeals, 1))
    return {
      totalMeals,
      averageCalories,
      averageProtein: 0,
      averageCarbs: 0,
      averageFat: 0,
      mealTypes: [],
      recentMeals: meals.slice(0, 5),
      favoriteFoods: [],
      dailyAverages: { avgCalories: averageCalories, avgProtein: 0, avgCarbs: 0, avgFat: 0, avgWater: 0 },
      dateRange: { start: params.startDate || '', end: params.endDate || '' }
    }
  },
  async getRecommendations() {
    const u = uid()
    const user = await getUserProfile(u)
    const weight = 70
    const calories = 2200
    return {
      calories,
      protein: Math.round(weight * 1.6),
      carbohydrates: Math.round((calories * 0.5) / 4),
      fat: Math.round((calories * 0.25) / 9),
      fiber: 30,
      water: 3000,
      ratios: { protein: 0.25, carbohydrates: 0.5, fat: 0.25 },
      bmr: 1600,
      tdee: calories
    }
  },
  async getSuggestions(params: any = {}) {
    return []
  }
}

export const workoutAPI = {
  async getWorkouts(params: any = {}) {
    const u = uid()
    const q = query(collection(db, 'workouts'), where('userId', '==', u), orderBy('startTime', 'desc'), fsLimit(params.limit || 20))
    const snaps = await getDocs(q)
    const data = snaps.docs.map(withId)
    const pagination = { page: params.page || 1, limit: params.limit || 20, total: data.length, pages: 1 }
    return { data, pagination }
  },
  async getWorkout(id: string) {
    const snap = await getDoc(doc(db, 'workouts', id))
    if (!snap.exists()) throw new Error('Not found')
    return withId(snap)
  },
  async createWorkout(workoutData: any) {
    const u = uid()
    const payload = {
      ...workoutData,
      userId: u,
      startTime: workoutData.startTime || new Date().toISOString(),
      completionStatus: workoutData.completionStatus || 'planned',
      exercises: workoutData.exercises || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const ref = await addDoc(collection(db, 'workouts'), payload)
    const snap = await getDoc(ref)
    return withId(snap)
  },
  async updateWorkout(id: string, data: any) {
    await updateDoc(doc(db, 'workouts', id), { ...data, updatedAt: new Date().toISOString() })
    const snap = await getDoc(doc(db, 'workouts', id))
    return withId(snap)
  },
  async deleteWorkout(id: string) {
    await deleteDoc(doc(db, 'workouts', id))
  },
  async startWorkout(id: string) {
    return this.updateWorkout(id, { completionStatus: 'in-progress', startTime: new Date().toISOString() })
  },
  async completeWorkout(id: string) {
    return this.updateWorkout(id, { completionStatus: 'completed', endTime: new Date().toISOString() })
  },
  async addExercise(workoutId: string, exercise: any) {
    const w = await this.getWorkout(workoutId)
    const exercises = [...(w.exercises || []), { ...exercise, _id: crypto.randomUUID?.() || `${Date.now()}` }]
    return this.updateWorkout(workoutId, { exercises })
  },
  async updateExercise(workoutId: string, exerciseId: string, exercise: any) {
    const w = await this.getWorkout(workoutId)
    const exercises = (w.exercises || []).map((e: any) => (e._id === exerciseId ? { ...e, ...exercise } : e))
    return this.updateWorkout(workoutId, { exercises })
  },
  async deleteExercise(workoutId: string, exerciseId: string) {
    const w = await this.getWorkout(workoutId)
    const exercises = (w.exercises || []).filter((e: any) => e._id !== exerciseId)
    return this.updateWorkout(workoutId, { exercises })
  },
  async getStats(params: any = {}) {
    const res = await this.getWorkouts(params)
    const workouts = res.data
    const totalWorkouts = workouts.length
    const totalDuration = workouts.reduce((s: number, w: any) => s + (w.duration?.actual || 0), 0)
    const totalCalories = workouts.reduce((s: number, w: any) => s + (w.caloriesBurned || 0), 0)
    return {
      totalWorkouts,
      totalDuration,
      totalCalories,
      averageIntensity: 0,
      workoutTypes: [],
      recentWorkouts: workouts.slice(0, 5),
      personalRecords: [],
      dateRange: { start: params.startDate || '', end: params.endDate || '' }
    }
  },
  async getTemplates() {
    const u = uid()
    const q = query(collection(db, 'workouts'), where('userId', '==', u), where('isTemplate', '==', true))
    const snaps = await getDocs(q)
    return snaps.docs.map(withId)
  },
  async createFromTemplate(templateId: string, data: any = {}) {
    const t = await this.getWorkout(templateId)
    const payload = { ...t, _id: undefined, isTemplate: false, templateName: undefined, name: data.name || t.name }
    return this.createWorkout(payload)
  }
}

export const apiService = {
  weight: {
    async getEntries(params: any = {}) {
      const u = uid()
      const q = query(collection(db, 'weight_entries'), where('userId', '==', u), orderBy('measuredAt', 'desc'), fsLimit(params.limit || 50))
      const snaps = await getDocs(q)
      const data = snaps.docs.map(withId)
      const pagination = { page: params.page || 1, limit: params.limit || 50, total: data.length, pages: 1 }
      return { data, pagination }
    },
    async getEntry(id: string) {
      const snap = await getDoc(doc(db, 'weight_entries', id))
      if (!snap.exists()) throw new Error('Not found')
      return withId(snap)
    },
    async createEntry(entryData: any) {
      const u = uid()
      const payload = {
        ...entryData,
        userId: u,
        measuredAt: entryData.measuredAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const ref = await addDoc(collection(db, 'weight_entries'), payload)
      const snap = await getDoc(ref)
      return withId(snap)
    },
    async updateEntry(id: string, data: any) {
      await updateDoc(doc(db, 'weight_entries', id), { ...data, updatedAt: new Date().toISOString() })
      const snap = await getDoc(doc(db, 'weight_entries', id))
      return withId(snap)
    },
    async deleteEntry(id: string) {
      await deleteDoc(doc(db, 'weight_entries', id))
    },
    async getTrends(params: any = {}) {
      const res = await this.getEntries(params)
      const entries = res.data.sort((a: any, b: any) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
      const trends = entries.map((e: any) => ({ date: e.measuredAt, avgWeight: e.weight?.value || 0 }))
      return { trends, statistics: null }
    },
    async getStatistics(params: any = {}) {
      const res = await this.getEntries(params)
      const entries = res.data
      const totalEntries = entries.length
      const weights = entries.map((e: any) => e.weight?.value || 0)
      const avgWeight = Math.round((weights.reduce((s: number, v: number) => s + v, 0) / Math.max(totalEntries, 1)) * 10) / 10
      return { totalEntries, avgWeight, minWeight: Math.min(...weights, 0), maxWeight: Math.max(...weights, 0) }
    },
    async getSummary() {
      const res = await this.getEntries({})
      const latest = res.data[0] || null
      return { latest }
    },
    async getLatest() {
      const res = await this.getEntries({})
      const entry = res.data[0] || null
      return { entry, comparison: null }
    },
    async compareEntries(id1: string, id2: string) {
      const e1 = await this.getEntry(id1)
      const e2 = await this.getEntry(id2)
      return { first: e1, second: e2 }
    },
    async bulkImport(data: { entries: any[] }) {
      const created: any[] = []
      for (const e of data.entries) {
        const c = await this.createEntry(e)
        created.push(c)
      }
      return { entries: created, imported: created.length }
    }
  },
  goals: {
    async getGoals(params: any = {}) {
      const u = uid()
      const q = query(collection(db, 'goals'), where('userId', '==', u), orderBy('createdAt', 'desc'), fsLimit(params.limit || 20))
      const snaps = await getDocs(q)
      const data = snaps.docs.map(withId)
      const pagination = { page: params.page || 1, limit: params.limit || 20, total: data.length, pages: 1 }
      return { data, pagination }
    },
    async getGoal(id: string) {
      const snap = await getDoc(doc(db, 'goals', id))
      if (!snap.exists()) throw new Error('Not found')
      return withId(snap)
    },
    async createGoal(goalData: any) {
      const u = uid()
      const payload = {
        ...goalData,
        userId: u,
        status: goalData.status || 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const ref = await addDoc(collection(db, 'goals'), payload)
      const snap = await getDoc(ref)
      return withId(snap)
    },
    async updateGoal(id: string, data: any) {
      await updateDoc(doc(db, 'goals', id), { ...data, updatedAt: new Date().toISOString() })
      const snap = await getDoc(doc(db, 'goals', id))
      return withId(snap)
    },
    async deleteGoal(id: string) {
      await deleteDoc(doc(db, 'goals', id))
    },
    async updateProgress(id: string, progressData: any) {
      return this.updateGoal(id, progressData)
      },
    async updateStatus(id: string, payload: any) {
      return this.updateGoal(id, payload)
    },
    async getAnalytics() {
      return {}
    },
    async getSummary() {
      return {}
    },
    async getInsights(id: string) {
      return {}
    },
    async syncGoal(id: string) {
      const g = await this.getGoal(id)
      return { goal: g }
    }
  }
}