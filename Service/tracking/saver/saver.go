// Package saver 用于统一存储key, value结构的mysql表。
// 采用Reflect实现
package saver

import "database/sql"

// Saver 执行具体保存任务
// 异步执行
type Saver struct {
	db *sql.DB

	tasks chan map[interface{}]interface{} // 要保存的数据
	table string
	sql   string
}

// NewSaver 创建一个新的保存器。
// Running协程不会自动启动，要靠外在启动
func NewSaver(db *sql.DB, bufferSize int, table, sql string) *Saver {
	return &Saver{
		db:    db,
		tasks: make(chan map[interface{}]interface{}, bufferSize),
		table: table,
		sql:   sql,
	}
}

// Save 异步保存数据库
func (s *Saver) Save(data map[interface{}]interface{}) error {
	s.tasks <- data
	return nil
}

func (s *Saver) doSave(data map[interface{}]interface{}) error {
	// TODO: 使用reflect进行数据库的存储

	// 也就是想办法拼出来这样的语句
	// INSERT INTO table (key1, key2, key3, field1, field2, field3) VALUES (key1, key2, key3, field1, field2, field3)
	// ON DUPLICATE KEY UPDATE fields1+=fields1, fields2+=fields2, fields3+=fields3
	// 也可以先在外面把SQL外进来
	// 然后提供把struct的字段给拼接成[]interface{}
	// 然后使用...即可

	if len(data) == 0 {
		return nil
	}

	// 提交Prepare可以避免重复解析SQL语句
	stmt, err := s.db.Prepare(s.sql)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for k, v := range data {
		var args Args
		args = args.AddFlat(k)
		args = args.AddFlat(v)
		args = args.AddFlat(v)
		_, err := stmt.Exec(args...)
		if err != nil {
			panic(err)
		}
	}

	return nil
}

// Running 存储协程
func (s *Saver) Running(stop chan struct{}) {
	for {
		select {
		case m := <-s.tasks:
			s.doSave(m)
		case <-stop:
			// 收所有的数据，防止的未写入数据库的
			for {
				select {
				case m := <-s.tasks:
					s.doSave(m)
				default:
					goto allreceived
				}
			}
		allreceived:
			return
		}
	}
}
