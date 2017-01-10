// Package gracequit 管理需要按反向顺序停止的协程
// 目前不运行协程中途退出
// 所以只用来管理常驻进程的协程
// 使用方式：
// gracequit.StartGoroutine(func(c StopSigChan) {
// 	workingGoroutine(c)
// })
// 工作线程在收到从c发过来的信号时，退出即可

package gracequit

import "sync"

// StopSigChan 用来传送关闭信号
type StopSigChan chan struct{}

// Finished 协程安全退出的时候，调用这个
// 只能调用一次
func (s StopSigChan) finished() {
	close(s)
}

// GraceQuit 用来保存被管理的协程
type GraceQuit struct {
	goroutines []StopSigChan
	m          sync.Mutex
}

// StartGoroutine 开启一个新的Goroutine，运行f
func (gq *GraceQuit) StartGoroutine(f func(c StopSigChan)) {
	gq.m.Lock()
	defer gq.m.Unlock()

	c := make(StopSigChan)
	gq.goroutines = append(gq.goroutines, c)
	go func() {
		defer c.finished()
		f(c)
	}()
}

// StopAll 按反向顺序停止goroutines
func (gq *GraceQuit) StopAll() {
	gq.m.Lock()
	defer gq.m.Unlock()

	// 反向关闭
	for i := range gq.goroutines {
		rev := len(gq.goroutines) - i - 1

		c := gq.goroutines[rev]
		c <- struct{}{}
		<-c
	}

	gq.goroutines = gq.goroutines[0:0]
}

var g GraceQuit

// StartGoroutine 开启一个新的Goroutine，运行f
var StartGoroutine = g.StartGoroutine

// StopAll 按反向顺序停止goroutines
var StopAll = g.StopAll
