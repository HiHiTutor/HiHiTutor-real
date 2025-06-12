'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Tutor {
  tutorId: string;
  name: string;
  avatar: string;
  subjects: string[];
  teachingAreas: string[];
  teachingMethods: string[];
  experience: number;
  rating: number;
  introduction: string;
}

interface TutorsResponse {
  tutors: Tutor[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export default function TutorsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '9',
        search: searchQuery,
        subjects: selectedSubjects.join(','),
        areas: selectedAreas.join(','),
        methods: selectedMethods.join(','),
        sortBy: 'rating',
        sortOrder: 'desc'
      });

      const response = await fetch(`/api/tutors?${queryParams}`);
      if (!response.ok) throw new Error('獲取導師列表失敗');
      
      const data: TutorsResponse = await response.json();
      setTutors(data.tutors);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching tutors:', error);
      toast.error('獲取導師列表失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, [currentPage, searchQuery, selectedSubjects, selectedAreas, selectedMethods]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTutors();
  };

  const handleTutorClick = (tutorId: string) => {
    router.push(`/tutors/${tutorId}`);
  };

  return (
    <div className="container mx-auto py-8">
      {/* 搜尋和篩選區域 */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <Input
            placeholder="搜尋導師..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>搜尋</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 科目篩選 */}
          <div className="space-y-2">
            <Label>教授科目</Label>
            <div className="flex flex-wrap gap-2">
              {['數學', '物理', '化學', '生物', '英文', '中文'].map((subject) => (
                <div key={subject} className="flex items-center space-x-2">
                  <Checkbox
                    id={subject}
                    checked={selectedSubjects.includes(subject)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSubjects([...selectedSubjects, subject]);
                      } else {
                        setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
                      }
                    }}
                  />
                  <Label htmlFor={subject}>{subject}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* 地區篩選 */}
          <div className="space-y-2">
            <Label>教學地區</Label>
            <div className="flex flex-wrap gap-2">
              {['中環', '金鐘', '銅鑼灣', '旺角', '沙田', '將軍澳'].map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={area}
                    checked={selectedAreas.includes(area)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAreas([...selectedAreas, area]);
                      } else {
                        setSelectedAreas(selectedAreas.filter((a) => a !== area));
                      }
                    }}
                  />
                  <Label htmlFor={area}>{area}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* 授課方式篩選 */}
          <div className="space-y-2">
            <Label>授課方式</Label>
            <div className="flex flex-wrap gap-2">
              {['面授', '網上', '混合'].map((method) => (
                <div key={method} className="flex items-center space-x-2">
                  <Checkbox
                    id={method}
                    checked={selectedMethods.includes(method)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMethods([...selectedMethods, method]);
                      } else {
                        setSelectedMethods(selectedMethods.filter((m) => m !== method));
                      }
                    }}
                  />
                  <Label htmlFor={method}>{method}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 導師列表 */}
      {loading ? (
        <div className="text-center py-8">載入中...</div>
      ) : tutors.length === 0 ? (
        <div className="text-center py-8">找不到符合條件的導師</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <Card key={tutor.tutorId} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleTutorClick(tutor.tutorId)}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={tutor.avatar} alt={tutor.name} />
                    <AvatarFallback>{tutor.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{tutor.name}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      教學經驗 {tutor.experience} 年
                    </div>
                    <div className="text-sm text-muted-foreground">
                      評分 {tutor.rating} / 5.0
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium mb-2">教授科目</div>
                      <div className="flex flex-wrap gap-2">
                        {tutor.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-2">教學地區</div>
                      <div className="flex flex-wrap gap-2">
                        {tutor.teachingAreas.map((area) => (
                          <Badge key={area} variant="outline">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-2">授課方式</div>
                      <div className="flex flex-wrap gap-2">
                        {tutor.teachingMethods.map((method) => (
                          <Badge key={method} variant="outline">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-2">簡介</div>
                      <p className="text-sm text-muted-foreground">{tutor.introduction}</p>
                    </div>
                    <Button className="w-full">查看詳情</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分頁 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                上一頁
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                下一頁
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 